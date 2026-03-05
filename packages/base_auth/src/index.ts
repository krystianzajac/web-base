// Types
export type { AuthConfig, User, Session, SsoProvider } from './types/auth'

// Context — exported so test utilities can inject mock auth state directly
export { AuthContext } from './context/auth-context'
export type { AuthContextValue } from './context/auth-context'

// Provider
export { AuthProvider } from './components/auth-provider'
export type { AuthProviderProps } from './components/auth-provider'

// Hooks
export { useAuth } from './hooks/use-auth'
export type { UseAuthReturn } from './hooks/use-auth'

export { useSession } from './hooks/use-session'
export type { UseSessionReturn } from './hooks/use-session'

export { useTwoFactor } from './hooks/use-two-factor'
export type { UseTwoFactorReturn } from './hooks/use-two-factor'

// Note: server helpers are exported from '@web-base/base-auth/server'
// to avoid bundling server-side code in client bundles.
