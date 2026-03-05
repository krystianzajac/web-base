import { mapSession } from '../client/mappers'
import { createServerClient } from './server-client'
import type { AuthConfig, Session } from '../types/auth'
import type { ServerCookieStore } from './types'

/**
 * Returns the current session from the cookie store, or null if unauthenticated.
 *
 * @example
 * ```ts
 * // app/some-page.tsx (Server Component)
 * import { cookies } from 'next/headers'
 * import { getServerSession } from '@web-base/base-auth/server'
 *
 * const session = await getServerSession(await cookies(), authConfig)
 * if (!session) redirect('/login')
 * ```
 */
export async function getServerSession(
  cookieStore: ServerCookieStore,
  config: AuthConfig,
): Promise<Session | null> {
  const client = createServerClient(cookieStore, config)
  const { data, error } = await client.auth.getSession()

  if (error || !data.session) return null
  return mapSession(data.session)
}
