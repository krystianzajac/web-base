import { createServerClient as supabaseCreateServerClient } from '@supabase/ssr'
import type { AuthConfig } from '../types/auth'
import type { CookieSetOptions, ServerCookieStore } from './types'

type CookieToSet = { name: string; value: string; options?: CookieSetOptions }

/**
 * Creates a Supabase server client for use in Next.js Server Components.
 *
 * @example
 * ```ts
 * // app/some-page.tsx (Server Component)
 * import { cookies } from 'next/headers'
 * import { createServerClient } from '@web-base/base-auth/server'
 *
 * const client = createServerClient(await cookies(), authConfig)
 * ```
 */
export function createServerClient(cookieStore: ServerCookieStore, config: AuthConfig) {
  return supabaseCreateServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        if (!cookieStore.set) return
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set!(name, value, options),
          )
        } catch {
          // Called from a Server Component — writes are ignored.
          // Session refresh is handled by middleware.
        }
      },
    },
  })
}
