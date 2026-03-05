import { useState, useEffect } from 'react'
import { useCmsContext } from './cms-context'
import { getCacheKey, readCache, writeCache } from '../cache/local-storage-cache'

const DEFAULT_CACHE_TTL_MS = 300_000 // 5 minutes

export interface UseCmsResult {
  content: string | null
  loading: boolean
  error: string | null
}

/**
 * Fetches a CMS string value by key and locale.
 *
 * - Cache hit within TTL: returns immediately from localStorage, no network call.
 * - Cache miss / expired: fetches via apiClient, updates cache.
 * - Locale not found + fallbackToDefaultLocale=true: retries with defaultLocale.
 * - Not found at all: content is null.
 *
 * The `apiClient` from `CmsProvider` should be a stable reference (memoized at
 * the call site) to prevent the effect from re-running on every parent render.
 *
 * @example
 * ```tsx
 * const { content, loading } = useCms('welcome_headline', 'en')
 * ```
 */
export function useCms(key: string, locale?: string): UseCmsResult {
  const { config, apiClient } = useCmsContext()
  const resolvedLocale = locale ?? config.defaultLocale
  const ttlMs = config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS

  // Synchronous cache check on mount — avoids loading flash when cache is warm.
  // On subsequent key/locale changes the effect handles state transitions.
  const [state, setState] = useState<UseCmsResult>(() => {
    const cacheKey = getCacheKey(config.appId, key, resolvedLocale)
    const cached = readCache(cacheKey, ttlMs)
    if (cached !== null) return { content: String(cached), loading: false, error: null }
    return { content: null, loading: true, error: null }
  })

  useEffect(() => {
    let cancelled = false

    async function load(loc: string, isFallback: boolean): Promise<void> {
      const cacheKey = getCacheKey(config.appId, key, loc)
      const cached = readCache(cacheKey, ttlMs)

      if (cached !== null) {
        if (!cancelled) setState({ content: String(cached), loading: false, error: null })
        return
      }

      // Cache miss — show loading state before the network round-trip
      if (!cancelled) setState({ content: null, loading: true, error: null })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const { data, error } = await apiClient
        .from('cms_content')
        .select('content_json')
        .eq('app_id', config.appId)
        .eq('key', key)
        .eq('locale', loc)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        setState({ content: null, loading: false, error: (error as { message: string }).message ?? String(error) })
        return
      }

      // No row found: try fallback locale if configured
      if (
        !data &&
        !isFallback &&
        (config.fallbackToDefaultLocale ?? true) &&
        loc !== config.defaultLocale
      ) {
        return load(config.defaultLocale, true)
      }

      const rawJson = (data as { content_json: unknown } | null)?.content_json ?? null
      const content = rawJson != null
        ? (typeof rawJson === 'string' ? rawJson : JSON.stringify(rawJson))
        : null

      if (rawJson != null) writeCache(cacheKey, rawJson)

      setState({ content, loading: false, error: null })
    }

    load(resolvedLocale, false)

    return () => {
      cancelled = true
    }
  }, [key, resolvedLocale, config.appId, ttlMs, config.defaultLocale, config.fallbackToDefaultLocale, apiClient])

  return state
}
