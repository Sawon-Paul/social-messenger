// Caching strategies for ConnectHub

/**
 * In-memory cache with TTL (Time To Live)
 */
export class Cache<K, V> {
  private cache: Map<K, { value: V; expiry: number }>;
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  set(key: K, value: V, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Singleton cache instances
export const userCache = new Cache<string, any>(10 * 60 * 1000); // 10 min
export const postCache = new Cache<string, any>(5 * 60 * 1000); // 5 min
export const notificationCache = new Cache<string, any>(2 * 60 * 1000); // 2 min

/**
 * Fetch with cache fallback
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const cached = userCache.get(key);
  if (cached) {
    return cached;
  }

  const data = await fetcher();
  userCache.set(key, data, ttl);
  
  return data;
}

/**
 * Debounce function for search inputs and scroll events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll and resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate a unique cache key for notifications
 */
export function getNotificationKey(userId: string, filter?: string): string {
  return `notifications:${userId}:${filter || 'all'}`;
}

/**
 * Generate a unique cache key for posts
 */
export function getPostKey(userId: string, page?: number): string {
  return `posts:${userId}:${page || 1}`;
}
