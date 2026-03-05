import type { ApiConfig } from '@web-base/base-api'
import type { AuthConfig } from '@web-base/base-auth'
import type { CmsConfig } from '@web-base/base-cms'

/**
 * Shared API config — reads from environment variables.
 * Falls back to placeholder values so `next build` succeeds without a real .env.local.
 */
export const apiConfig: ApiConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
}

export const authConfig: AuthConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
  ssoProviders: ['google', 'github'],
  redirectUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : 'http://localhost:3000/auth/callback',
}

export const cmsConfig: CmsConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
  appId: 'example-app',
  defaultLocale: 'en',
  cacheTtlMs: 300_000,
  fallbackToDefaultLocale: true,
}
