import { createServerApiClient } from '@web-base/base-api'
import type { ServerCookieStore } from '@web-base/base-api'
import type { CmsConfig, CmsEntry } from '../types/cms-config'

/**
 * Creates server-side CMS helpers for use in Next.js Server Components and
 * Route Handlers. Returns plain async functions (not hooks).
 *
 * Uses `createServerApiClient` from `base_api` internally — no new Supabase
 * connection is created by the caller.
 *
 * @example
 * ```ts
 * // app/page.tsx (Server Component)
 * const cms = createServerCmsClient(await cookies(), cmsConfig)
 * const headline = await cms.getCmsContent('home_headline', 'en')
 * ```
 */
export function createServerCmsClient(cookieStore: ServerCookieStore, config: CmsConfig) {
  const apiConfig = {
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = createServerApiClient(cookieStore, apiConfig)

  /**
   * Fetches a single CMS string value from the server.
   * Returns null if the key+locale combination does not exist.
   */
  async function getCmsContent(key: string, locale: string): Promise<string | null> {
    const { data, error } = await client
      .from('cms_content')
      .select('content_json')
      .eq('app_id', config.appId)
      .eq('key', key)
      .eq('locale', locale)
      .maybeSingle()

    if (error || !data) return null

    const raw = (data as Pick<CmsEntry, 'content_json'>).content_json
    if (raw == null) return null
    return typeof raw === 'string' ? raw : JSON.stringify(raw)
  }

  /**
   * Fetches and parses a CMS JSON value as typed T.
   * Returns null if not found or if the value cannot be parsed.
   */
  async function getCmsJson<T>(key: string, locale: string): Promise<T | null> {
    const { data, error } = await client
      .from('cms_content')
      .select('content_json')
      .eq('app_id', config.appId)
      .eq('key', key)
      .eq('locale', locale)
      .maybeSingle()

    if (error || !data) return null

    const raw = (data as Pick<CmsEntry, 'content_json'>).content_json
    if (raw == null) return null

    try {
      if (typeof raw === 'string') return JSON.parse(raw) as T
      return raw as T
    } catch {
      return null
    }
  }

  /**
   * Fetches multiple CMS keys in a **single Supabase query** using `.in()`.
   * Returns a map of `key → content string`. Missing keys are omitted.
   *
   * Intended for use in `layout.tsx` to preload content before page render.
   */
  async function preloadCms(keys: string[], locale: string): Promise<Record<string, string>> {
    if (keys.length === 0) return {}

    const { data, error } = await client
      .from('cms_content')
      .select('key,content_json')
      .eq('app_id', config.appId)
      .eq('locale', locale)
      .in('key', keys)

    if (error || !data) return {}

    const result: Record<string, string> = {}
    for (const row of data as CmsEntry[]) {
      if (row.key && row.content_json != null) {
        result[row.key] =
          typeof row.content_json === 'string'
            ? row.content_json
            : JSON.stringify(row.content_json)
      }
    }
    return result
  }

  return { getCmsContent, getCmsJson, preloadCms }
}
