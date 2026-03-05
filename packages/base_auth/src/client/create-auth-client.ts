import { createBrowserClient } from '@supabase/ssr'
import type { AuthConfig } from '../types/auth'

/**
 * Creates a Supabase browser client configured for auth.
 * Internal to the package — never exported in public API.
 */
export function createBrowserAuthClient(config: AuthConfig) {
  return createBrowserClient(config.supabaseUrl, config.supabaseAnonKey)
}

export type BrowserAuthClient = ReturnType<typeof createBrowserAuthClient>
