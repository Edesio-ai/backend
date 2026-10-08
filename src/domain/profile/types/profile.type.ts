export const PROFILE_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const PROFILE_PHOTO_EXTENSION_BY_MIME: Record<(typeof PROFILE_PHOTO_MIME_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export type ProfilePhotoMimeType = (typeof PROFILE_PHOTO_MIME_TYPES)[number];

export type ProfilePhotoUpload = {
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
  byteLength: number;
};

export function isProfilePhotoMimeType(mimeType: string): mimeType is ProfilePhotoMimeType {
  return (PROFILE_PHOTO_MIME_TYPES as readonly string[]).includes(mimeType);
}
