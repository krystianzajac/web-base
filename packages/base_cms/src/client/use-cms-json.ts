import { useState, useEffect } from 'react'
import { useCmsContext } from './cms-context'
import { getCacheKey, readCache, writeCache } from '../cache/local-storage-cache'

const DEFAULT_CACHE_TTL_MS = 300_000

export interface UseCmsJsonResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Parses `content_json` as typed T. Handles malformed or unexpected values
 * gracefully: if the value cannot be used as T, returns `data: null` instead of
 * throwing.
 *
 * The `apiClient` from `CmsProvider` should be a stable reference (memoized at
 * the call site) to prevent the effect from re-running on every parent render.
 *
 * @example
 * ```tsx
 * const { data } = useCmsJson<{ headline: string; body: string }>('home_hero')
 * ```
 */
export function useCmsJson<T>(key: string, locale?: string): UseCmsJsonResult<T> {
  const { config, apiClient } = useCmsContext()
  const resolvedLocale = locale ?? config.defaultLocale
  const ttlMs = config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS

  // Synchronous cache check on mount — avoids loading flash when cache is warm.
  const [state, setState] = useState<UseCmsJsonResult<T>>(() => {
    const cacheKey = getCacheKey(config.appId, key, resolvedLocale)
    const cached = readCache(cacheKey, ttlMs)
    if (cached !== null) return { data: parseJson<T>(cached), loading: false, error: null }
    return { data: null, loading: true, error: null }
  })

  useEffect(() => {
    let cancelled = false

    async function load(loc: string, isFallback: boolean): Promise<void> {
      const cacheKey = getCacheKey(config.appId, key, loc)
      const cached = readCache(cacheKey, ttlMs)

      if (cached !== null) {
        if (!cancelled) setState({ data: parseJson<T>(cached), loading: false, error: null })
        return
      }

      // Cache miss — show loading state before the network round-trip
      if (!cancelled) setState({ data: null, loading: true, error: null })

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
        setState({ data: null, loading: false, error: (error as { message: string }).message ?? String(error) })
        return
      }

      if (
        !data &&
        !isFallback &&
        (config.fallbackToDefaultLocale ?? true) &&
        loc !== config.defaultLocale
      ) {
        return load(config.defaultLocale, true)
      }

      const rawJson = (data as { content_json: unknown } | null)?.content_json ?? null
      const parsed = parseJson<T>(rawJson)

      if (rawJson != null) writeCache(cacheKey, rawJson)

      setState({ data: parsed, loading: false, error: null })
    }

    load(resolvedLocale, false)

    return () => {
      cancelled = true
    }
  }, [key, resolvedLocale, config.appId, ttlMs, config.defaultLocale, config.fallbackToDefaultLocale, apiClient])

  return state
}

/**
 * Safely converts a raw content_json value to type T.
 *
 * - If raw is null/undefined → null
 * - If raw is already an object → cast directly to T (Supabase returns parsed JSONB)
 * - If raw is a string → try JSON.parse (handles edge-case string storage)
 * - If JSON.parse fails → null (malformed JSON, not throw)
 */
function parseJson<T>(raw: unknown): T | null {
  if (raw === null || raw === undefined) return null
  try {
    if (typeof raw === 'string') {
      return JSON.parse(raw) as T
    }
    return raw as T
  } catch {
    return null
  }
}
