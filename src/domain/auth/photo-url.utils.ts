export function resolveProfilePhotoUrl(
  avatarUrl: string | undefined,
  photoUrl: string | null | undefined,
): string | null {
  if (typeof avatarUrl === 'string' && avatarUrl.length > 0) {
    return avatarUrl;
  }
  if (typeof photoUrl === 'string' && photoUrl.length > 0) {
    return photoUrl;
  }
  return null;
}
