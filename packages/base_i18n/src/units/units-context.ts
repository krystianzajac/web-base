'use client'

import { createContext, useContext } from 'react'
import type { UnitsContextValue } from '../types/i18n-types'

export const UnitsContext = createContext<UnitsContextValue | null>(null)

export function useUnitsContext(): UnitsContextValue {
  const ctx = useContext(UnitsContext)
  if (!ctx) throw new Error('useUnitsContext must be used inside <UnitsProvider>')
  return ctx
}
