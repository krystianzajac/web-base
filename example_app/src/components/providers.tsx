'use client'

import React, { useMemo } from 'react'
import { AuthProvider } from '@web-base/base-auth'
import { ApiQueryProvider } from '@web-base/base-api'
import { CmsProvider } from '@web-base/base-cms'
import { createBrowserApiClient } from '@web-base/base-api'
import { LocaleProvider, UnitsProvider } from '@web-base/base-i18n'
import { authConfig, apiConfig, cmsConfig } from '@/lib/config'

/**
 * Client-side provider tree — wraps the entire app in auth, query, and CMS
 * contexts. Rendered inside the Server Component layout.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Stable browser client — memoised so CmsProvider effect deps don't fire on every render
  const browserApiClient = useMemo(() => createBrowserApiClient(apiConfig), [])

  return (
    <LocaleProvider>
      <UnitsProvider>
        <AuthProvider config={authConfig}>
          <ApiQueryProvider>
            <CmsProvider config={cmsConfig} apiClient={browserApiClient}>
              {children}
            </CmsProvider>
          </ApiQueryProvider>
        </AuthProvider>
      </UnitsProvider>
    </LocaleProvider>
  )
}
