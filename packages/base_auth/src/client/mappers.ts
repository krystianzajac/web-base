import type { User, Session } from '../types/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseUser = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseSession = Record<string, any>

/**
 * Maps a raw Supabase user object to our own User type.
 * Keeps Supabase internals out of the public API.
 */
export function mapUser(raw: SupabaseUser): User {
  return {
    id: raw.id as string,
    email: (raw.email as string) ?? '',
    displayName:
      (raw.user_metadata?.display_name as string | undefined) ??
      (raw.user_metadata?.full_name as string | undefined) ??
      null,
    avatarUrl: (raw.user_metadata?.avatar_url as string | undefined) ?? null,
    createdAt: new Date(raw.created_at as string),
  }
}

/**
 * Maps a raw Supabase session object to our own Session type.
 */
export function mapSession(raw: SupabaseSession): Session {
  return {
    token: raw.access_token as string,
    expiresAt: new Date((raw.expires_at as number) * 1000),
    userId: (raw.user?.id as string) ?? '',
  }
}
