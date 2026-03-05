import { createBrowserClient } from '@supabase/ssr'
import { wrapSupabaseClient } from './wrap-supabase-client'
import type { ApiConfig } from '../types/config'

/**
 * Creates a base_api client for use in Client Components and browser contexts.
 *
 * Returns the full Supabase query builder — if you have generated types from
 * `supabase gen types typescript`, pass them as the generic to get column-level
 * type safety:
 *
 * @example
 * ```ts
 * import type { Database } from '@/lib/database.types'
 *
 * const client = createBrowserApiClient<Database>({
 *   supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 * })
 *
 * // Fully typed query — column names and types enforced by TypeScript
 * const { data, error } = await client.from('profiles').select('*').eq('id', userId).single()
 * // error is normalised to ApiError | null at runtime (types show PostgrestError | null)
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createBrowserApiClient<TDatabase = any>(config: ApiConfig) {
  const supabase = createBrowserClient<TDatabase>(config.supabaseUrl, config.supabaseAnonKey)

  return wrapSupabaseClient<typeof supabase>(supabase, {
    retryAttempts: config.retryAttempts ?? 3,
    retryDelay: config.retryDelay ?? 1000,
  })
}
