interface CacheEntry {
  content: unknown
  timestamp: number
}

/** Builds the localStorage key for a CMS entry. */
export function getCacheKey(appId: string, key: string, locale: string): string {
  return `cms_${appId}_${key}_${locale}`
}

/**
 * Returns cached content if it exists and is within the TTL, otherwise null.
 * Silently ignores any localStorage errors (SSR, private browsing, quota).
 */
export function readCache(cacheKey: string, ttlMs: number): unknown {
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > ttlMs) return null
    return entry.content
  } catch {
    return null
  }
}

/**
 * Writes content to localStorage with the current timestamp.
 * Silently ignores any localStorage errors (SSR, private browsing, quota).
 */
export function writeCache(cacheKey: string, content: unknown): void {
  try {
    const entry: CacheEntry = { content, timestamp: Date.now() }
    localStorage.setItem(cacheKey, JSON.stringify(entry))
  } catch {
    // localStorage may be unavailable (SSR, private mode, quota exceeded)
  }
}

/** Removes a cache entry. */
export function clearCacheEntry(cacheKey: string): void {
  try {
    localStorage.removeItem(cacheKey)
  } catch {
    // ignore
  }
}
