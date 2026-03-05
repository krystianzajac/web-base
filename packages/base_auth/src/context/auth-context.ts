import { createContext, useContext } from 'react'
import type { User, Session, SsoProvider } from '../types/auth'

export interface AuthContextValue {
  // ── State ──────────────────────────────────────────────
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null

  // ── Auth methods ───────────────────────────────────────
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string, displayName: string): Promise<void>
  signOut(): Promise<void>
  signInWithSSO(provider: SsoProvider): Promise<void>
  resetPassword(email: string): Promise<void>

  // ── Session ────────────────────────────────────────────
  refresh(): Promise<void>

  // ── 2FA ───────────────────────────────────────────────
  mfaIsEnrolled: boolean
  mfaEnroll(): Promise<{ qrUri: string; secret: string }>
  mfaVerify(code: string): Promise<void>
  mfaUnenroll(): Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** @internal */
export function requireAuthContext(hook: string): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error(`${hook} must be used inside <AuthProvider>`)
  }
  return ctx
}
