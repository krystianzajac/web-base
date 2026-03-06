'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { UnitsContext } from './units-context'
import type { UnitSystem } from '../types/i18n-types'

const STORAGE_KEY = 'web-base:unit-system'
const DEFAULT_SYSTEM: UnitSystem = 'metric'

function getStoredSystem(): UnitSystem {
  if (typeof window === 'undefined') return DEFAULT_SYSTEM
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'imperial' ? 'imperial' : DEFAULT_SYSTEM
}

interface UnitsProviderProps {
  children: ReactNode
  /** Override the initial unit system (e.g. set 'imperial' for US region). */
  initialSystem?: UnitSystem
}

/**
 * Provides unit system context to the app. Place this near the root of your component tree.
 * The user's preference is persisted to localStorage.
 */
export function UnitsProvider({ children, initialSystem }: UnitsProviderProps) {
  // Lazy initializer reads localStorage only on the client; server returns DEFAULT_SYSTEM.
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(
    () => initialSystem ?? getStoredSystem(),
  )

  const setUnitSystem = useCallback((system: UnitSystem) => {
    localStorage.setItem(STORAGE_KEY, system)
    setUnitSystemState(system)
  }, [])

  return (
    <UnitsContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </UnitsContext.Provider>
  )
}
