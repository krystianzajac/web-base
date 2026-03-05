import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider } from '../components/auth-provider'
import type { AuthConfig } from '../types/auth'

export const testConfig: AuthConfig = {
  supabaseUrl: 'https://test.supabase.co',
  supabaseAnonKey: 'test-anon-key',
  ssoProviders: ['google', 'github'],
  redirectUrl: 'https://myapp.com/auth/callback',
}

export function renderAuthHook<T>(hookFn: () => T) {
  return renderHook(hookFn, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AuthProvider config={testConfig}>{children}</AuthProvider>
    ),
  })
}

export { act }
