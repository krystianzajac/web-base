import { createServerClient } from '@supabase/ssr'
import { wrapSupabaseClient } from './wrap-supabase-client'
import type { ApiConfig, CookieSetOptions, ServerCookieStore } from '../types/config'

type CookieToSet = { name: string; value: string; options?: CookieSetOptions }

/**
 * Creates a base_api client for use in Server Components, Server Actions, and Route Handlers.
 *
 * Reads the session from the Next.js cookie store, so the user's auth token is
 * automatically attached to every Supabase request. Pass the Database generic for
 * full type safety on all queries.
 *
 * @example
 * ```ts
 * import { cookies } from 'next/headers'
 * import type { Database } from '@/lib/database.types'
 *
 * // In a Server Component:
 * const client = createServerApiClient<Database>(await cookies(), apiConfig)
 * const { data: profile } = await client.from('profiles').select('*').eq('id', userId).single()
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServerApiClient<TDatabase = any>(
  cookieStore: ServerCookieStore,
  config: ApiConfig,
) {
  const supabase = createServerClient<TDatabase>(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        if (!cookieStore.set) return
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set!(name, value, options))
        } catch {
          // Called from a Server Component — writes are ignored; middleware handles refresh.
        }
      },
    },
  })

  return wrapSupabaseClient<typeof supabase>(supabase, {
    retryAttempts: config.retryAttempts ?? 3,
    retryDelay: config.retryDelay ?? 1000,
  })
}
