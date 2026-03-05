import React, { createContext, useContext, type ReactNode } from 'react'
import type { CmsConfig } from '../types/cms-config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CmsApiClient = any

interface CmsContextValue {
  config: CmsConfig
  apiClient: CmsApiClient
}

const CmsContext = createContext<CmsContextValue | null>(null)

export interface CmsProviderProps {
  config: CmsConfig
  /**
   * A browser API client created via `createBrowserApiClient` from `@web-base/base-api`.
   * The provider uses this client — it does NOT create its own Supabase connection.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiClient: any
  children: ReactNode
}

/**
 * Required at app root. Provides CMS config and the shared API client to all
 * `useCms` / `useCmsJson` hooks in the tree.
 *
 * @example
 * ```tsx
 * <CmsProvider config={cmsConfig} apiClient={browserApiClient}>
 *   {children}
 * </CmsProvider>
 * ```
 */
export function CmsProvider({ config, apiClient, children }: CmsProviderProps) {
  return (
    <CmsContext.Provider value={{ config, apiClient }}>
      {children}
    </CmsContext.Provider>
  )
}

/** @internal Used by useCms and useCmsJson — not exported from the package. */
export function useCmsContext(): CmsContextValue {
  const ctx = useContext(CmsContext)
  if (!ctx) {
    throw new Error('useCms must be used inside a <CmsProvider>')
  }
  return ctx
}
