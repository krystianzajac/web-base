import { useRequiredAuthContext } from '../context/auth-context'
import type { User, SsoProvider } from '../types/auth'

export interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string, displayName: string): Promise<void>
  signOut(): Promise<void>
  signInWithSSO(provider: SsoProvider): Promise<void>
  resetPassword(email: string): Promise<void>
}

/**
 * Access the current user and authentication methods.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): UseAuthReturn {
  const ctx = useRequiredAuthContext('useAuth')
  return {
    user: ctx.user,
    loading: ctx.loading,
    error: ctx.error,
    signIn: ctx.signIn,
    signUp: ctx.signUp,
    signOut: ctx.signOut,
    signInWithSSO: ctx.signInWithSSO,
    resetPassword: ctx.resetPassword,
  }
}
