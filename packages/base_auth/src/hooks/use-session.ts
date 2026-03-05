import { requireAuthContext } from '../context/auth-context'
import type { Session } from '../types/auth'

export interface UseSessionReturn {
  session: Session | null
  isExpired: boolean
  refresh(): Promise<void>
}

/**
 * Access the current session and session management methods.
 * Must be used inside <AuthProvider>.
 */
export function useSession(): UseSessionReturn {
  const ctx = requireAuthContext('useSession')

  const isExpired =
    ctx.session !== null && ctx.session.expiresAt.getTime() < Date.now()

  return {
    session: ctx.session,
    isExpired,
    refresh: ctx.refresh,
  }
}
