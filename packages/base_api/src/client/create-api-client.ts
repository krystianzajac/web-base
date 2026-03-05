import { createBrowserClient } from '@supabase/ssr'
import { ApiClient } from './api-client'
import type { ApiConfig } from '../types/config'

/**
 * Creates an ApiClient configured for browser use.
 *
 * @example
 * ```ts
 * const api = createApiClient({
 *   supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 * })
 * ```
 */
export function createApiClient(config: ApiConfig): ApiClient {
  const supabase = createBrowserClient(config.supabaseUrl, config.supabaseAnonKey)

  return new ApiClient(supabase, {
    retryAttempts: config.retryAttempts ?? 3,
    retryDelay: config.retryDelay ?? 1000,
    timeout: config.timeout ?? 10000,
  })
}
