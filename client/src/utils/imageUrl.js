/**
 * Utility to format image URLs
 * Handles both full Cloudinary URLs and local relative paths
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  
  // If it's already a full URL (Cloudinary, Unsplash, etc.)
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Get API URL from env
  const apiRoot = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${apiRoot}${normalizedPath}`;
};

export default getImageUrl;
