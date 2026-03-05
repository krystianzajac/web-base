import { vi } from 'vitest'
import type { AuthContextValue } from '@web-base/base-auth'

export type MockAuthState = AuthContextValue

/**
 * Creates a mock auth context value suitable for injecting via AuthContext.Provider.
 *
 * Default state: unauthenticated, not loading, no error.
 * All async methods are vi.fn() that resolve immediately.
 *
 * @example
 * ```ts
 * const auth = createMockAuthService({ user: TestData.user() })
 * renderWithBrand(<MyComponent />, { authState: auth })
 * ```
 */
export function createMockAuthService(overrides?: Partial<MockAuthState>): MockAuthState {
  return {
    user: null,
    session: null,
    loading: false,
    error: null,
    signIn: vi.fn().mockResolvedValue(undefined),
    signUp: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    signInWithSSO: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
    mfaIsEnrolled: false,
    mfaEnroll: vi.fn().mockResolvedValue({ qrUri: 'otpauth://test', secret: 'TESTSECRET' }),
    mfaVerify: vi.fn().mockResolvedValue(undefined),
    mfaUnenroll: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}
