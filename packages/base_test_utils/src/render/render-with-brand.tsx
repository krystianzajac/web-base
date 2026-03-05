import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { BrandProvider } from '@web-base/base-ui'
import type { AppBrand } from '@web-base/base-ui'
import { AuthContext } from '@web-base/base-auth'
import { ApiQueryProvider } from '@web-base/base-api'
import { CmsProvider } from '@web-base/base-cms'
import type { CmsQueryClient } from '@web-base/base-cms'
import { TestBrands } from '../data/test-brands'
import { createMockAuthService } from '../mocks/mock-auth-service'
import type { MockAuthState } from '../mocks/mock-auth-service'

export interface RenderWithBrandOptions {
  brand?: AppBrand
  locale?: string
  queryClient?: QueryClient
  /** Pre-populate auth context — e.g. pass createMockAuthService({ user: TestData.user() }) */
  authState?: Partial<MockAuthState>
}

/**
 * Renders `ui` wrapped in all root providers: BrandProvider, AuthContext
 * (with mock auth), ApiQueryProvider, and CmsProvider.
 *
 * Replaces all provider boilerplate in integration tests.
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithBrand(<MyComponent />, {
 *   brand: TestBrands.dark,
 *   authState: { user: TestData.user({ displayName: 'Alice' }) },
 * })
 * ```
 */
export function renderWithBrand(
  ui: React.ReactElement,
  options: RenderWithBrandOptions = {},
): RenderResult {
  const { brand = TestBrands.plain, queryClient, authState } = options
  const mockAuth = createMockAuthService(authState)

  // Minimal chainable mock — returns empty data for all CMS queries by default
  const noopChain: Record<string, unknown> = {}
  const handler = {
    get(_: object, prop: string) {
      if (prop === 'maybeSingle') return async () => ({ data: null, error: null })
      if (prop === 'single') return async () => ({ data: null, error: null })
      return () => new Proxy(noopChain, handler)
    },
  }
  const mockCmsClient: CmsQueryClient = {
    from: () => new Proxy(noopChain, handler),
  }

  const mockCmsConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-anon-key',
    appId: 'test-app',
    defaultLocale: 'en',
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrandProvider brand={brand}>
        <AuthContext.Provider value={mockAuth}>
          <ApiQueryProvider client={queryClient}>
            <CmsProvider config={mockCmsConfig} apiClient={mockCmsClient}>
              {children}
            </CmsProvider>
          </ApiQueryProvider>
        </AuthContext.Provider>
      </BrandProvider>
    )
  }

  return render(ui, { wrapper: Wrapper })
}
