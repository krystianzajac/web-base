import { vi } from 'vitest'

/** Canonical mock Supabase user (Supabase-shaped). */
export const mockRawUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: { display_name: 'Test User', avatar_url: 'https://example.com/avatar.jpg' },
  created_at: '2024-01-01T00:00:00.000Z',
}

/** Canonical mock Supabase session (Supabase-shaped). */
export const mockRawSession = {
  access_token: 'tok-abc',
  expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  user: mockRawUser,
}

export const mockRawExpiredSession = {
  ...mockRawSession,
  expires_at: Math.floor(Date.now() / 1000) - 60, // 1 minute ago
}

/** Subscription object returned by onAuthStateChange */
const mockSubscription = { unsubscribe: vi.fn() }

// Track the registered callback so tests can trigger state changes
export let capturedAuthCallback: ((event: string, session: unknown) => void) | null = null

export const mockAuthClient = {
  auth: {
    onAuthStateChange: vi.fn((cb: (event: string, session: unknown) => void) => {
      capturedAuthCallback = cb
      return { data: { subscription: mockSubscription } }
    }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithOAuth: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    refreshSession: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    mfa: {
      listFactors: vi.fn().mockResolvedValue({ data: { totp: [] }, error: null }),
      enroll: vi.fn(),
      challenge: vi.fn(),
      verify: vi.fn(),
      unenroll: vi.fn(),
    },
  },
}

/** Reset all mocks and captured state between tests. */
export function resetMocks() {
  capturedAuthCallback = null
  vi.clearAllMocks()
  mockAuthClient.auth.onAuthStateChange.mockImplementation(
    (cb: (event: string, session: unknown) => void) => {
      capturedAuthCallback = cb
      return { data: { subscription: mockSubscription } }
    },
  )
  mockAuthClient.auth.mfa.listFactors.mockResolvedValue({ data: { totp: [] }, error: null })
}
