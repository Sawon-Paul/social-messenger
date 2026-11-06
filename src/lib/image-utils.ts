// Image optimization utilities for ConnectHub

/**
 * Get optimized image URL based on device capabilities
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  width: number,
  height?: number,
  quality: number = 75
): string {
  if (!originalUrl) return '';
  
  // If it's already a Next.js optimized image, use that
  if (originalUrl.startsWith('/_next/image')) {
    return originalUrl;
  }
  
  // For Supabase storage images, add resize parameters
  if (originalUrl.includes('supabase.co/storage')) {
    const baseUrl = originalUrl.split('?')[0];
    const params = new URLSearchParams(originalUrl.split('?')[1]);
    
    // Add quality parameter if not present
    if (!params.has('quality')) {
      params.set('quality', quality.toString());
    }
    
    // Add resize parameter
    if (width && height) {
      params.set('resize', `w=${width},h=${height}`);
    } else if (width) {
      params.set('w', width.toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  return originalUrl;
}

/**
 * Get thumbnail URL for avatars and small images
 */
export function getThumbnailUrl(url: string | null, size: number = 100): string {
  if (!url) return '';
  return getOptimizedImageUrl(url, size, size);
}

/**
 * Get medium quality URL for feed images
 */
export function getMediumImageUrl(url: string | null): string {
  if (!url) return '';
  return getOptimizedImageUrl(url, 800, 600, 80);
}

/**
 * Get high quality URL for full-size display
 */
export function getHighImageUrl(url: string | null): string {
  if (!url) return '';
  return getOptimizedImageUrl(url, 1920, 1080, 90);
}

/**
 * Lazy loading placeholder color for images (BLIP technique)
 */
export const IMAGE_PLACEHOLDERS = {
  avatar: 'bg-gradient-to-br from-blue-500 to-purple-600',
  post: 'bg-gray-200 dark:bg-gray-700',
  story: 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500',
  cover: 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400',
};

/**
 * Image loading states
 */
export type ImageLoadState = 'loading' | 'loaded' | 'error';
