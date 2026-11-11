// Cliente y utilidades para Cloudflare R2 (Almacenamiento multimedia GAM Pelechuco)
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export interface R2UploadResult {
  fileKey: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
}

export const R2_CONFIG = {
  accountId: import.meta.env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || '',
  accessKeyId: import.meta.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '',
  bucketName: import.meta.env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || 'pelechuco',
  publicUrlBase: import.meta.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || 'https://r2.pelechuco.gob.bo',
  folders: ['hero', 'conoce', 'galeria', 'noticias', 'autoridades', 'tramites', 'general'] as const,
};

export type R2Folder = (typeof R2_CONFIG.folders)[number];

export function isR2Configured(): boolean {
  return (
    Boolean(R2_CONFIG.accountId) &&
    R2_CONFIG.accountId !== 'placeholder-account-id' &&
    Boolean(R2_CONFIG.accessKeyId) &&
    R2_CONFIG.accessKeyId !== 'placeholder-access-key' &&
    Boolean(R2_CONFIG.secretAccessKey) &&
    R2_CONFIG.secretAccessKey !== 'placeholder-secret-key'
  );
}

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
      },
    });
  }

  return s3ClientInstance;
}

export function buildR2PublicUrl(fileKey: string): string {
  const base = R2_CONFIG.publicUrlBase.replace(/\/$/, '');
  const cleanKey = fileKey.replace(/^\//, '');
  return `${base}/${cleanKey}`;
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
 * Sube un archivo a Cloudflare R2 vía S3 API compatible
 */
export async function uploadToR2(
  fileBuffer: Uint8Array | Buffer,
  fileName: string,
  mimeType: string,
  folder: R2Folder = 'general'
): Promise<R2UploadResult> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 no está configurado. Ingrese R2_ACCOUNT_ID, R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY en su archivo .env');
  }

  const cleanName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const fileKey = `${folder}/${timestamp}-${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await client.send(command);

  const publicUrl = buildR2PublicUrl(fileKey);

  return {
    fileKey,
    publicUrl,
    fileName: cleanName,
    mimeType,
    fileSizeBytes: fileBuffer.byteLength,
  };
}

/**
 * Elimina un archivo de Cloudflare R2
 */
export async function deleteFromR2(fileKey: string): Promise<boolean> {
  const client = getR2Client();
  if (!client) return false;

  const command = new DeleteObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: fileKey,
  });

  await client.send(command);
  return true;
}
