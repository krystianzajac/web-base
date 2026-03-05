import { createServerClient } from '@supabase/ssr'
import { wrapSupabaseClient } from './wrap-supabase-client'
import type { ApiConfig, CookieSetOptions, MiddlewareRequest } from '../types/config'

type CookieToSet = { name: string; value: string; options?: CookieSetOptions }

/**
 * Creates a base_api client for use in Next.js middleware.
 *
 * Returns the wrapped client AND the pending cookies that must be applied to
 * the outgoing response. Session refresh in middleware requires writing updated
 * cookies back to the response.
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { NextResponse } from 'next/server'
 * import type { NextRequest } from 'next/server'
 *
 * export async function middleware(request: NextRequest) {
 *   const response = NextResponse.next()
 *   const { client, pendingCookies } = createMiddlewareApiClient(request, apiConfig)
 *
 *   // Trigger session refresh
 *   await client.auth.getUser()
 *
 *   // Apply updated cookies to the response
 *   pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
 *   return response
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMiddlewareApiClient<TDatabase = any>(
  request: MiddlewareRequest,
  config: ApiConfig,
) {
  const pendingCookies: CookieToSet[] = []

  const supabase = createServerClient<TDatabase>(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        pendingCookies.push(...cookiesToSet)
      },
    },
  })

  return {
    client: wrapSupabaseClient<typeof supabase>(supabase, {
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000,
    }),
    pendingCookies,
  }
}
