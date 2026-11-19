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

export const SUPABASE_STORAGE_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB Plan Gratuito Supabase Storage
export const SUPABASE_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB límite por archivo

export interface FolderStorageStat {
  folder: StorageFolder;
  count: number;
  bytes: number;
}

export interface StorageSummary {
  totalBytes: number;
  totalFiles: number;
  quotaBytes: number;
  freeBytes: number;
  percentUsed: string;
  percentNumber: number;
  imageCount: number;
  docCount: number;
  otherCount: number;
  byFolder: Record<StorageFolder, FolderStorageStat>;
}

export interface MediaUsageRef {
  section: string;
  label: string;
  editUrl: string;
  folder: StorageFolder;
}

export function normalizeStorageFolder(input?: string | null): StorageFolder {
  const firstSegment = String(input || '').trim().toLowerCase().split('/')[0];
  if ((STORAGE_CONFIG.folders as readonly string[]).includes(firstSegment)) {
    return firstSegment as StorageFolder;
  }
  return 'general';
}

export function inferMimeTypeFromName(fileName: string, fallbackMime?: string | null): string {
  if (fallbackMime && fallbackMime !== 'application/octet-stream') return fallbackMime;
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return fallbackMime || 'application/octet-stream';
}

export function formatStorageBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function computeStorageSummary(
  files: Array<{ file_size_bytes?: number | null; folder?: string | null; mime_type?: string | null }>
): StorageSummary {
  const byFolder = Object.fromEntries(
    STORAGE_CONFIG.folders.map((folder) => [folder, { folder, count: 0, bytes: 0 }])
  ) as Record<StorageFolder, FolderStorageStat>;

  let totalBytes = 0;
  let imageCount = 0;
  let docCount = 0;
  let otherCount = 0;

  for (const file of files) {
    const size = Number(file.file_size_bytes || 0);
    const folder = normalizeStorageFolder(file.folder);
    const mime = (file.mime_type || '').toLowerCase();

    totalBytes += size;
    byFolder[folder].count += 1;
    byFolder[folder].bytes += size;

    if (mime.startsWith('image/')) {
      imageCount += 1;
    } else if (mime.includes('pdf') || mime.includes('document') || mime.includes('word')) {
      docCount += 1;
    } else {
      otherCount += 1;
    }
  }

  const freeBytes = Math.max(0, SUPABASE_STORAGE_QUOTA_BYTES - totalBytes);
  const rawPct = (totalBytes / SUPABASE_STORAGE_QUOTA_BYTES) * 100;
  const percentNumber = Math.min(100, Number(rawPct.toFixed(3)));
  const percentUsed = rawPct >= 1 ? rawPct.toFixed(1) : rawPct >= 0.01 ? rawPct.toFixed(2) : rawPct.toFixed(3);

  return {
    totalBytes,
    totalFiles: files.length,
    quotaBytes: SUPABASE_STORAGE_QUOTA_BYTES,
    freeBytes,
    percentUsed,
    percentNumber,
    imageCount,
    docCount,
    otherCount,
    byFolder,
  };
}

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

interface StorageObjectEntry {
  fileKey: string;
  fileName: string;
  folder: StorageFolder;
  mimeType: string;
  size: number;
}

async function listAllBucketObjects(adminClient: any): Promise<{ entries: StorageObjectEntry[]; complete: boolean }> {
  const entries: StorageObjectEntry[] = [];
  const queue: string[] = [''];
  let complete = true;

  while (queue.length > 0) {
    const prefix = queue.shift()!;
    let offset = 0;
    const pageSize = 100;

    while (true) {
      const { data: items, error } = await adminClient.storage
        .from(STORAGE_CONFIG.bucketName)
        .list(prefix, { limit: pageSize, offset });

      if (error || !items) {
        complete = false;
        break;
      }

      for (const item of items) {
        if (!item.name || item.name === '.emptyFolderPlaceholder') continue;
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

        if (!item.id) {
          queue.push(fullPath);
          continue;
        }

        entries.push({
          fileKey: fullPath,
          fileName: item.name,
          folder: normalizeStorageFolder(fullPath),
          mimeType: inferMimeTypeFromName(item.name, item.metadata?.mimetype),
          size: Number(item.metadata?.size || 0),
        });
      }

      if (items.length < pageSize) break;
      offset += pageSize;
    }
  }

  return { entries, complete };
}

/**
 * Escanea recursivamente el bucket 'pelechuco-media' y mantiene r2_media 100% congruente.
 */
export async function syncStorageWithDatabase(): Promise<number> {
  const adminClient = getSupabaseAdmin() || supabase;
  if (!isSupabaseConfigured() || !adminClient) return 0;

  try {
    await ensureBucketExists();

    const { data: existingRecords } = await adminClient
      .from('r2_media')
      .select('id, file_key, file_size_bytes, folder, mime_type');

    const existingMap = new Map<string, { id: string; file_size_bytes: number; folder: string; mime_type: string }>();
    for (const r of (existingRecords || []) as any[]) {
      existingMap.set(r.file_key, r);
    }

    const { entries, complete } = await listAllBucketObjects(adminClient);
    const seenKeys = new Set<string>();
    let newItemsCount = 0;

    for (const entry of entries) {
      seenKeys.add(entry.fileKey);
      const existing = existingMap.get(entry.fileKey);

      if (!existing) {
        const { data: pubData } = adminClient.storage
          .from(STORAGE_CONFIG.bucketName)
          .getPublicUrl(entry.fileKey);

        const { error: upsertErr } = await adminClient.from('r2_media').upsert([{
          file_key: entry.fileKey,
          public_url: pubData.publicUrl,
          bucket_name: STORAGE_CONFIG.bucketName,
          file_name: entry.fileName,
          mime_type: entry.mimeType,
          file_size_bytes: entry.size,
          folder: entry.folder,
        }], { onConflict: 'file_key' });

        if (!upsertErr) newItemsCount++;
      } else if (
        (existing.file_size_bytes === 0 && entry.size > 0) ||
        existing.folder !== entry.folder ||
        (!existing.mime_type && entry.mimeType)
      ) {
        await adminClient.from('r2_media').update({
          file_size_bytes: entry.size || existing.file_size_bytes,
          folder: entry.folder,
          mime_type: entry.mimeType || existing.mime_type,
        }).eq('id', existing.id);
      }
    }

    // Limpia registros huérfanos en BD si el escaneo del bucket terminó sin errores
    if (complete && existingMap.size > 0) {
      const staleIds: string[] = [];
      for (const [key, rec] of existingMap.entries()) {
        if (!seenKeys.has(key)) staleIds.push(rec.id);
      }
      if (staleIds.length > 0) {
        await adminClient.from('r2_media').delete().in('id', staleIds);
      }
    }

    return newItemsCount;
  } catch (err) {
    console.warn('Aviso: Error durante la sincronización de archivos de almacenamiento:', err);
    return 0;
  }
}

/**
 * Recopila todas las URLs de imágenes y documentos activas en las tablas del portal
 * para cruzarlas con r2_media y mostrar referencias externas o estado "En uso".
 */
export async function collectPortalMediaUsages(client: any): Promise<Map<string, MediaUsageRef[]>> {
  const usageMap = new Map<string, MediaUsageRef[]>();

  const registerUsage = (rawUrl: string | null | undefined, ref: MediaUsageRef) => {
    const url = (rawUrl || '').trim();
    if (!url) return;
    const list = usageMap.get(url) || [];
    const alreadyExists = list.some(item => item.section === ref.section && item.label === ref.label);
    if (!alreadyExists) {
      list.push(ref);
      usageMap.set(url, list);
    }
  };

  try {
    const [
      heroRes,
      conoceIntroRes,
      conoceSecRes,
      galeriaRes,
      autoridadesRes,
      noticiasRes,
      noticiasAdjRes,
      tramitesRes,
      tramitesArchRes,
    ] = await Promise.all([
      client.from('hero_section').select('bg_image_url, title_main'),
      client.from('conoce_intro').select('image_url, title'),
      client.from('conoce_secciones').select('slug, title, image_url'),
      client.from('galeria_imagenes').select('title, image_url'),
      client.from('autoridades').select('name, photo_url'),
      client.from('noticias').select('title, featured_image_url, gallery_images'),
      client.from('noticias_adjuntos').select('file_title, file_url'),
      client.from('tramites').select('title, image_url, document_url'),
      client.from('tramites_archivos').select('file_title, file_url'),
    ]);

    for (const h of heroRes.data || []) {
      registerUsage(h.bg_image_url, {
        section: 'Portada (Hero)',
        label: h.title_main || 'Imagen principal de portada',
        editUrl: '/admin/configuracion',
        folder: 'hero',
      });
    }

    for (const ci of conoceIntroRes.data || []) {
      registerUsage(ci.image_url, {
        section: 'Conoce Pelechuco',
        label: ci.title || 'Introducción territorial',
        editUrl: '/admin/configuracion',
        folder: 'conoce',
      });
    }

    for (const cs of conoceSecRes.data || []) {
      registerUsage(cs.image_url, {
        section: 'Conoce Pelechuco',
        label: cs.title || cs.slug || 'Sección territorial',
        editUrl: '/admin/configuracion',
        folder: 'conoce',
      });
    }

    for (const g of galeriaRes.data || []) {
      registerUsage(g.image_url, {
        section: 'Galería Municipal',
        label: g.title || 'Fotografía de galería',
        editUrl: '/admin/galeria',
        folder: 'galeria',
      });
    }

    for (const a of autoridadesRes.data || []) {
      registerUsage(a.photo_url, {
        section: 'Autoridades',
        label: a.name || 'Retrato institucional',
        editUrl: '/admin/autoridades',
        folder: 'autoridades',
      });
    }

    for (const n of noticiasRes.data || []) {
      registerUsage(n.featured_image_url, {
        section: 'Noticias',
        label: n.title || 'Portada de noticia',
        editUrl: '/admin/noticias',
        folder: 'noticias',
      });
      if (Array.isArray(n.gallery_images)) {
        for (const extraUrl of n.gallery_images) {
          registerUsage(extraUrl, {
            section: 'Noticias (Galería)',
            label: n.title || 'Foto adicional de noticia',
            editUrl: '/admin/noticias',
            folder: 'noticias',
          });
        }
      }
    }

    for (const na of noticiasAdjRes.data || []) {
      registerUsage(na.file_url, {
        section: 'Noticias (Adjunto)',
        label: na.file_title || 'Documento adjunto',
        editUrl: '/admin/noticias',
        folder: 'noticias',
      });
    }

    for (const t of tramitesRes.data || []) {
      registerUsage(t.image_url, {
        section: 'Trámites',
        label: t.title || 'Imagen de trámite',
        editUrl: '/admin/tramites',
        folder: 'tramites',
      });
      registerUsage(t.document_url, {
        section: 'Trámites (PDF)',
        label: t.title || 'Formulario de trámite',
        editUrl: '/admin/tramites',
        folder: 'tramites',
      });
    }

    for (const ta of tramitesArchRes.data || []) {
      registerUsage(ta.file_url, {
        section: 'Trámites (Archivo)',
        label: ta.file_title || 'Documento descargable',
        editUrl: '/admin/tramites',
        folder: 'tramites',
      });
    }
  } catch (err) {
    console.warn('Aviso recopilando referencias de media del portal:', err);
  }

  return usageMap;
}

