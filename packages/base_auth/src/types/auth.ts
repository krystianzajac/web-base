/**
 * Configuration for the auth package.
 * Pass this to AuthProvider and server helpers.
 */
export interface AuthConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  /** OAuth providers enabled for this app */
  ssoProviders: ('google' | 'apple' | 'github')[]
  /** OAuth redirect URL (e.g. https://myapp.com/auth/callback) */
  redirectUrl: string
}

/**
 * App-owned User type — Supabase types never leak beyond this package.
 */
export interface User {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  createdAt: Date
}

/**
 * App-owned Session type.
 */
export interface Session {
  token: string
  expiresAt: Date
  userId: string
}

export type SsoProvider = 'google' | 'apple' | 'github'
