/**
 * Configuration for base_api client factories.
 */
export interface ApiConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  /** Number of retry attempts for transient errors. Default: 3 */
  retryAttempts?: number
  /** Base delay in ms between retries (doubles each attempt). Default: 1000 */
  retryDelay?: number
  /** Request timeout in ms. Default: 10000 */
  timeout?: number
}

/** A cookie item as returned by Next.js cookie store. */
export interface CookieItem {
  name: string
  value: string
}

/** Options for setting a cookie. */
export interface CookieSetOptions {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: 'strict' | 'lax' | 'none'
  secure?: boolean
}

/** Framework-agnostic cookie store (structurally compatible with Next.js ReadonlyRequestCookies). */
export interface ServerCookieStore {
  getAll(): CookieItem[]
  set?(name: string, value: string, options?: CookieSetOptions): void
}

/** Framework-agnostic middleware request (structurally compatible with NextRequest). */
export interface MiddlewareRequest {
  cookies: {
    getAll(): CookieItem[]
    set(name: string, value: string): void
  }
}
