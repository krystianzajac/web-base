/**
 * Generic cookie interfaces — framework-agnostic.
 * Next.js ReadonlyRequestCookies / ResponseCookies satisfy these.
 */
export interface CookieItem {
  name: string
  value: string
}

export interface CookieSetOptions {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: 'strict' | 'lax' | 'none' | boolean
  secure?: boolean
}

/**
 * Cookie store for server components (read + optional write).
 * Matches Next.js ReadonlyRequestCookies.
 */
export interface ServerCookieStore {
  getAll(): CookieItem[]
  set?(name: string, value: string, options?: CookieSetOptions): void
}

/**
 * Request interface for middleware helpers.
 * Matches the Next.js NextRequest shape that we need.
 */
export interface MiddlewareRequest {
  url: string
  cookies: {
    getAll(): CookieItem[]
    set(name: string, value: string): void
  }
}

/** Cookies to be applied to the middleware response. */
export interface SessionUpdateResult {
  cookies: Array<CookieItem & { options?: CookieSetOptions }>
}
