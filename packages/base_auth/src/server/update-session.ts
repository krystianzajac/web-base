import { createMiddlewareClient } from './middleware-client'
import type { AuthConfig } from '../types/auth'
import type { MiddlewareRequest, SessionUpdateResult } from './types'

/**
 * Refreshes the auth session in Next.js middleware.
 * Apply the returned cookies to the middleware response.
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { NextResponse } from 'next/server'
 * import { updateSession } from '@web-base/base-auth/server'
 *
 * export async function middleware(request: NextRequest) {
 *   const result = await updateSession(request, authConfig)
 *   const response = NextResponse.next({ request })
 *   result.cookies.forEach(({ name, value, options }) =>
 *     response.cookies.set(name, value, options)
 *   )
 *   return response
 * }
 * ```
 */
export async function updateSession(
  request: MiddlewareRequest,
  config: AuthConfig,
): Promise<SessionUpdateResult> {
  const { client, pendingCookies } = createMiddlewareClient(request, config)
  // Calling getUser() refreshes the session token if it's close to expiry.
  await client.auth.getUser()
  return { cookies: pendingCookies }
}
