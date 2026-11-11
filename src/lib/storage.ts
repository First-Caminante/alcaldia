// Cliente y utilidades para Supabase Storage (Almacenamiento multimedia optimizado GAM Pelechuco)
import { getSupabaseAdmin, supabase, isSupabaseConfigured } from './supabase';

export interface StorageUploadResult {
  fileKey: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
}

export const STORAGE_CONFIG = {
  bucketName: 'pelechuco-media',
  folders: ['hero', 'conoce', 'galeria', 'noticias', 'autoridades', 'tramites', 'general'] as const,
};

export type StorageFolder = (typeof STORAGE_CONFIG.folders)[number];

let bucketVerified = false;

/**
 * Asegura que el bucket público exista en Supabase Storage
 */
export async function ensureBucketExists(): Promise<void> {
  if (bucketVerified) return;
  const adminClient = getSupabaseAdmin();
  if (!adminClient) return;

  try {
    const { data: buckets, error: listError } = await adminClient.storage.listBuckets();
    if (!listError && buckets) {
      const exists = buckets.some(b => b.name === STORAGE_CONFIG.bucketName);
      if (!exists) {
        await adminClient.storage.createBucket(STORAGE_CONFIG.bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB límite por archivo
          allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'application/pdf']
        });
      }
      bucketVerified = true;
    }
  } catch (err) {
    console.warn('Aviso: Verificación de bucket Supabase:', err);
  }
}

export function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Sube un archivo a Supabase Storage en el bucket público 'pelechuco-media'
 */
export async function uploadToSupabaseStorage(
  fileBuffer: Uint8Array | Buffer,
  fileName: string,
  mimeType: string,
  folder: StorageFolder = 'general'
): Promise<StorageUploadResult> {
  const adminClient = getSupabaseAdmin() || supabase;
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado.');
  }

  await ensureBucketExists();

  const cleanName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const fileKey = `${folder}/${timestamp}-${cleanName}`;

  const { error } = await adminClient.storage
    .from(STORAGE_CONFIG.bucketName)
    .upload(fileKey, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Error en Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = adminClient.storage
    .from(STORAGE_CONFIG.bucketName)
    .getPublicUrl(fileKey);

  const publicUrl = publicUrlData.publicUrl;

  return {
    fileKey,
    publicUrl,
    fileName: cleanName,
    mimeType,
    fileSizeBytes: fileBuffer.byteLength,
  };
}

/**
 * Elimina un archivo de Supabase Storage
 */
export async function deleteFromSupabaseStorage(fileKey: string): Promise<boolean> {
  const adminClient = getSupabaseAdmin() || supabase;
  const { error } = await adminClient.storage
    .from(STORAGE_CONFIG.bucketName)
    .remove([fileKey]);

  return !error;
}

/**
 * Escanea y sincroniza archivos existentes en el bucket 'pelechuco-media' con la tabla r2_media
 * para garantizar que ninguna foto subida se pierda en el panel administrativo.
 */
export async function syncStorageWithDatabase(): Promise<number> {
  const adminClient = getSupabaseAdmin() || supabase;
  if (!isSupabaseConfigured() || !adminClient) return 0;

  try {
    await ensureBucketExists();

    const { data: existingRecords } = await adminClient
      .from('r2_media')
      .select('file_key');

    const registeredKeys = new Set((existingRecords || []).map((r: { file_key: string }) => r.file_key));
    let newItemsCount = 0;

    for (const folder of STORAGE_CONFIG.folders) {
      const { data: files } = await adminClient.storage
        .from(STORAGE_CONFIG.bucketName)
        .list(folder, { limit: 100 });

      if (!files) continue;

      for (const item of files) {
        if (!item.id) continue; // Omite carpetas virtuales
        const fileKey = `${folder}/${item.name}`;

        if (!registeredKeys.has(fileKey)) {
          const { data: pubData } = adminClient.storage
            .from(STORAGE_CONFIG.bucketName)
            .getPublicUrl(fileKey);

          const isWebp = item.name.endsWith('.webp');
          const isPng = item.name.endsWith('.png');
          const isPdf = item.name.endsWith('.pdf');
          const isJpg = item.name.endsWith('.jpg') || item.name.endsWith('.jpeg');

          let mimeType = item.metadata?.mimetype;
          if (!mimeType) {
            if (isWebp) mimeType = 'image/webp';
            else if (isPng) mimeType = 'image/png';
            else if (isPdf) mimeType = 'application/pdf';
            else if (isJpg) mimeType = 'image/jpeg';
            else mimeType = 'application/octet-stream';
          }

          const size = item.metadata?.size || 0;

          await adminClient.from('r2_media').insert([{
            file_key: fileKey,
            public_url: pubData.publicUrl,
            bucket_name: STORAGE_CONFIG.bucketName,
            file_name: item.name,
            mime_type: mimeType,
            file_size_bytes: size,
            folder: folder,
          }]);

          registeredKeys.add(fileKey);
          newItemsCount++;
        }
      }
    }

    return newItemsCount;
  } catch (err) {
    console.warn('Aviso: Error durante la sincronización de archivos de almacenamiento:', err);
    return 0;
  }
}

