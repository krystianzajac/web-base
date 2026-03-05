/** Row shape from the cms_content Supabase table. */
export interface CmsEntry {
  id?: string
  app_id: string
  key: string
  locale: string
  content_json: unknown
  version?: number
  created_at?: string
  updated_at?: string
}

/**
 * Configuration for the CMS service. Used by both client and server helpers.
 *
 * `supabaseUrl` and `supabaseAnonKey` are only required when using
 * `createServerCmsClient` — the client-side `CmsProvider` receives an
 * already-constructed `apiClient`.
 */
export interface CmsConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  /** Your app's unique identifier — matches the `app_id` column in cms_content. */
  appId: string
  /** Locale used when no locale is specified (e.g. 'en'). */
  defaultLocale: string
  /** localStorage TTL in milliseconds. Default: 300000 (5 minutes). */
  cacheTtlMs?: number
  /** Retry fetch with defaultLocale when requested locale is not found. Default: true. */
  fallbackToDefaultLocale?: boolean
}
