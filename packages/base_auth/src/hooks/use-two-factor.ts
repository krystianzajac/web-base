import { requireAuthContext } from '../context/auth-context'

export interface UseTwoFactorReturn {
  isEnrolled: boolean
  enroll(): Promise<{ qrUri: string; secret: string }>
  verify(code: string): Promise<void>
  unenroll(): Promise<void>
}

/**
 * Manage TOTP two-factor authentication.
 * Must be used inside <AuthProvider>.
 */
export function useTwoFactor(): UseTwoFactorReturn {
  const ctx = requireAuthContext('useTwoFactor')

  return {
    isEnrolled: ctx.mfaIsEnrolled,
    enroll: ctx.mfaEnroll,
    verify: ctx.mfaVerify,
    unenroll: ctx.mfaUnenroll,
  }
}
