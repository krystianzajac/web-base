'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/auth-context'
import { createBrowserAuthClient } from '../client/create-auth-client'
import { mapUser, mapSession } from '../client/mappers'
import type { AuthConfig, Session, SsoProvider, User } from '../types/auth'
import type { BrowserAuthClient } from '../client/create-auth-client'

export interface AuthProviderProps {
  config: AuthConfig
  children: React.ReactNode
}

/**
 * Wraps the application and manages auth state.
 * Required at app root before any auth hooks can be used.
 */
export function AuthProvider({ config, children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mfaIsEnrolled, setMfaIsEnrolled] = useState(false)

  // Stable client ref — recreated only if config changes
  const clientRef = useRef<BrowserAuthClient | null>(null)
  const configRef = useRef(config)

  if (!clientRef.current || configRef.current !== config) {
    clientRef.current = createBrowserAuthClient(config)
    configRef.current = config
  }

  const getClient = () => clientRef.current!

  const checkMfaEnrollment = useCallback(async (client: BrowserAuthClient) => {
    try {
      const { data } = await client.auth.mfa.listFactors()
      setMfaIsEnrolled((data?.totp?.length ?? 0) > 0)
    } catch {
      setMfaIsEnrolled(false)
    }
  }, [])

  useEffect(() => {
    const client = getClient()
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, supabaseSession) => {
      if (supabaseSession) {
        setUser(mapUser(supabaseSession.user))
        setSession(mapSession(supabaseSession))
        await checkMfaEnrollment(client)
      } else {
        setUser(null)
        setSession(null)
        setMfaIsEnrolled(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkMfaEnrollment])

  // ── Auth methods ────────────────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const { error: err } = await getClient().auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      throw new Error(err.message)
    }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      setError(null)
      const { error: err } = await getClient().auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      })
      if (err) {
        setError(err.message)
        throw new Error(err.message)
      }
    },
    [],
  )

  const signOut = useCallback(async () => {
    setError(null)
    const { error: err } = await getClient().auth.signOut()
    if (err) {
      setError(err.message)
      throw new Error(err.message)
    }
  }, [])

  const signInWithSSO = useCallback(
    async (provider: SsoProvider) => {
      setError(null)
      const { error: err } = await getClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo: config.redirectUrl },
      })
      if (err) {
        setError(err.message)
        throw new Error(err.message)
      }
    },
    [config.redirectUrl],
  )

  const resetPassword = useCallback(async (email: string) => {
    setError(null)
    const { error: err } = await getClient().auth.resetPasswordForEmail(email, {
      redirectTo: config.redirectUrl,
    })
    if (err) {
      setError(err.message)
      throw new Error(err.message)
    }
  }, [config.redirectUrl])

  // ── Session ─────────────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    const { data, error: err } = await getClient().auth.refreshSession()
    if (err) {
      setError(err.message)
      throw new Error(err.message)
    }
    if (data.session) {
      setSession(mapSession(data.session))
    }
  }, [])

  // ── 2FA ─────────────────────────────────────────────────────────────────────

  const mfaEnroll = useCallback(async (): Promise<{ qrUri: string; secret: string }> => {
    const { data, error: err } = await getClient().auth.mfa.enroll({ factorType: 'totp' })
    if (err) {
      setError(err.message)
      throw new Error(err.message)
    }
    return {
      qrUri: data.totp.qr_code,
      secret: data.totp.secret,
    }
  }, [])

  const mfaVerify = useCallback(async (code: string) => {
    // First get the factor id of the first unenrolled TOTP factor
    const { data: factors } = await getClient().auth.mfa.listFactors()
    const factorId = factors?.totp?.[0]?.id
    if (!factorId) throw new Error('No TOTP factor found to verify')

    const { data: challenge } = await getClient().auth.mfa.challenge({ factorId })
    if (!challenge) throw new Error('Failed to create MFA challenge')

    const { error: err } = await getClient().auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })
    if (err) {
      setError(err.message)
      throw new Error(err.message)
    }
    setMfaIsEnrolled(true)
  }, [])

  const mfaUnenroll = useCallback(async () => {
    const { data: factors } = await getClient().auth.mfa.listFactors()
    const factorId = factors?.totp?.[0]?.id
    if (!factorId) throw new Error('No TOTP factor found to unenroll')

    const { error: err } = await getClient().auth.mfa.unenroll({ factorId })
    if (err) {
      setError(err.message)
      throw new Error(err.message)
    }
    setMfaIsEnrolled(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        signInWithSSO,
        resetPassword,
        refresh,
        mfaIsEnrolled,
        mfaEnroll,
        mfaVerify,
        mfaUnenroll,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
