const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Returns an absolute URL for a package/tour cover image so it loads on the home page.
 * If the stored value is relative (e.g. /uploads/images/xxx), prepends the API base.
 */
export function getPackageImageUrl(coverImage, images, defaultImage = '') {
  const raw = coverImage || images?.[0];
  if (!raw || typeof raw !== 'string') return defaultImage;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = API_BASE.replace(/\/$/, '');
  return base + (raw.startsWith('/') ? raw : `/${raw}`);
}
