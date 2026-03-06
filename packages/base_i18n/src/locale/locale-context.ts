'use client'

import { createContext, useContext } from 'react'
import type { LocaleContextValue } from '../types/i18n-types'

export const LocaleContext = createContext<LocaleContextValue | null>(null)

/** Returns the current locale context. Must be used inside <LocaleProvider>. */
export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocaleContext must be used inside <LocaleProvider>')
  return ctx
}
