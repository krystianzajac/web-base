'use client'

import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { CmsConfig, CmsQueryClient } from '../types/cms-config'

interface CmsContextValue {
  config: CmsConfig
  apiClient: CmsQueryClient
}

const CmsContext = createContext<CmsContextValue | null>(null)

export interface CmsProviderProps {
  config: CmsConfig
  /**
   * A browser API client created via `createBrowserApiClient` from `@web-base/base-api`.
   * The provider uses this client — it does NOT create its own Supabase connection.
   *
   * Memoize this at the call site (`useMemo` / module-level constant) to prevent
   * unnecessary hook re-runs on parent re-renders.
   */
  apiClient: CmsQueryClient
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
  // Memoize context value so consumers only re-render when config or apiClient changes
  const value = useMemo(() => ({ config, apiClient }), [config, apiClient])
  return (
    <CmsContext.Provider value={value}>
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
