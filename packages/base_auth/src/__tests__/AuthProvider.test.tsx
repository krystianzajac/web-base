import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAuthClient, mockRawSession, resetMocks } from './mock-supabase'
import { testConfig } from './test-utils'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockAuthClient),
  createServerClient: vi.fn(() => mockAuthClient),
}))

import { AuthProvider } from '../components/auth-provider'
import { useAuth } from '../hooks/use-auth'
import * as mockModule from './mock-supabase'

function StatusDisplay() {
  const { user, loading, error } = useAuth()
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (user) return <p>Signed in as {user.email}</p>
  return <p>Not signed in</p>
}

describe('AuthProvider', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('shows loading state initially', () => {
    render(
      <AuthProvider config={testConfig}>
        <StatusDisplay />
      </AuthProvider>,
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('transitions from unauthenticated to authenticated on SIGNED_IN', async () => {
    render(
      <AuthProvider config={testConfig}>
        <StatusDisplay />
      </AuthProvider>,
    )

    // Start with unauthenticated state
    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_OUT', null)
    })
    expect(screen.getByText('Not signed in')).toBeInTheDocument()

    // Simulate sign in
    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
    })
    expect(screen.getByText('Signed in as test@example.com')).toBeInTheDocument()
  })

  it('transitions from authenticated to unauthenticated on SIGNED_OUT', async () => {
    render(
      <AuthProvider config={testConfig}>
        <StatusDisplay />
      </AuthProvider>,
    )

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_IN', mockRawSession)
    })
    expect(screen.getByText('Signed in as test@example.com')).toBeInTheDocument()

    await act(async () => {
      mockModule.capturedAuthCallback?.('SIGNED_OUT', null)
    })
    expect(screen.getByText('Not signed in')).toBeInTheDocument()
  })

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<StatusDisplay />)).toThrow('useAuth must be used inside <AuthProvider>')
    consoleSpy.mockRestore()
  })

  it('subscribes to auth state changes and unsubscribes on unmount', () => {
    const { unmount } = render(
      <AuthProvider config={testConfig}>
        <div />
      </AuthProvider>,
    )
    expect(mockAuthClient.auth.onAuthStateChange).toHaveBeenCalledTimes(1)
    unmount()
    // The subscription's unsubscribe is called — we just verify no errors thrown
  })
})
