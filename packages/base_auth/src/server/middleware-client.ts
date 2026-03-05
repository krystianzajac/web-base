import { createServerClient as supabaseCreateServerClient } from '@supabase/ssr'
import type { AuthConfig } from '../types/auth'
import type { CookieSetOptions, MiddlewareRequest, SessionUpdateResult } from './types'

type CookieToSet = { name: string; value: string; options?: CookieSetOptions }

/**
 * Creates a Supabase client for use in Next.js middleware.
 * Returns both the client and a cookie-setter for applying set-cookie headers.
 *
 * @internal — prefer `updateSession` for most middleware use cases.
 */
export function createMiddlewareClient(
  request: MiddlewareRequest,
  config: AuthConfig,
): {
  client: ReturnType<typeof supabaseCreateServerClient>
  pendingCookies: SessionUpdateResult['cookies']
} {
  const pendingCookies: SessionUpdateResult['cookies'] = []

  const client = supabaseCreateServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        pendingCookies.push(
          ...cookiesToSet.map(({ name, value, options }) => ({ name, value, options })),
        )
      },
    },
  })

  return { client, pendingCookies }
}
