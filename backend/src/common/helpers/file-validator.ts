import { BadRequestException } from '@nestjs/common';

/** MIME types cho phep upload */
const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/** Max file size mac dinh: 20MB */
const DEFAULT_MAX_SIZE = 20 * 1024 * 1024;

export interface FileValidationOptions {
  /** Max size in bytes (default 20MB) */
  maxSize?: number;
  /** Custom allowed MIME types (default: images) */
  allowedMimes?: string[];
  /** Cho phep cac loai file: 'image' | 'document' | 'all' */
  type?: 'image' | 'document' | 'all';
}

/**
 * Validate uploaded file — kiem tra MIME type va size.
 * Su dung trong controller truoc khi xu ly file.
 */
export function validateUploadedFile(
  file: { mimetype: string; size: number; originalname: string },
  options: FileValidationOptions = {},
): void {
  const maxSize = options.maxSize || DEFAULT_MAX_SIZE;
  const type = options.type || 'image';

  // Check size
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    throw new BadRequestException(
      `File "${file.originalname}" exceeds ${maxMB}MB limit`,
    );
  }

  // Determine allowed MIMEs
  let allowedMimes = options.allowedMimes;
  if (!allowedMimes) {
    if (type === 'image') allowedMimes = ALLOWED_IMAGE_MIMES;
    else if (type === 'document') allowedMimes = ALLOWED_DOC_MIMES;
    else allowedMimes = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_DOC_MIMES];
  }

  if (!allowedMimes.includes(file.mimetype)) {
    throw new BadRequestException(
      `File type "${file.mimetype}" is not allowed. Accepted: ${allowedMimes.join(', ')}`,
    );
  }
}

/**
 * Sanitize filename — xoa ky tu dac biet, giu extension.
 */
export function sanitizeFilename(filename: string): string {
  const ext = filename.split('.').pop() || '';
  const name = filename
    .replace(/\.[^.]+$/, '') // remove extension
    .replace(/[^a-zA-Z0-9_-]/g, '_') // chỉ giữ alphanumeric, _ , -
    .replace(/_+/g, '_') // collapse multiple underscores
    .substring(0, 100); // max 100 chars

  return ext ? `${name}.${ext.toLowerCase()}` : name;
}

/**
 * Extract file extension tu filename hoac MIME type.
 */
export function getExtension(filename: string): string {
  return (filename.split('.').pop() || '').toLowerCase();
}
