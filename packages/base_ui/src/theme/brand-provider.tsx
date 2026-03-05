import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AppBrand } from '../types/brand'
import { darken, lighten } from './color-utils'

interface BrandContextValue {
  brand: AppBrand
  isDark: boolean
  toggleDark: () => void
}

const BrandContext = createContext<BrandContextValue | null>(null)

/**
 * Wraps the application and injects brand CSS variables into :root.
 * Also manages dark mode via the `data-theme="dark"` attribute.
 */
export function BrandProvider({
  brand,
  children,
}: {
  brand: AppBrand
  children: React.ReactNode
}) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement

    const surfaceLight = lighten(brand.secondaryColor, 90)
    const backgroundLight = lighten(brand.secondaryColor, 95)
    const textPrimary = darken(brand.secondaryColor, 10)
    const textSecondary = lighten(brand.secondaryColor, 20)
    const textDisabled = lighten(brand.secondaryColor, 60)
    const divider = lighten(brand.secondaryColor, 75)

    const lightVars: Record<string, string> = {
      '--color-primary': brand.primaryColor,
      '--color-secondary': brand.secondaryColor,
      '--color-error': brand.errorColor,
      '--color-success': brand.successColor,
      '--color-warning': brand.warningColor,
      '--color-surface': surfaceLight,
      '--color-background': backgroundLight,
      '--color-text-primary': textPrimary,
      '--color-text-secondary': textSecondary,
      '--color-text-disabled': textDisabled,
      '--color-divider': divider,
    }

    for (const [key, value] of Object.entries(lightVars)) {
      root.style.setProperty(key, value)
    }
  }, [brand])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.setAttribute('data-theme', 'dark')

      const surfaceDark = darken(brand.secondaryColor, 20)
      const backgroundDark = darken(brand.secondaryColor, 40)
      const textPrimaryDark = lighten(brand.secondaryColor, 90)
      const textSecondaryDark = lighten(brand.secondaryColor, 70)
      const textDisabledDark = lighten(brand.secondaryColor, 40)
      const dividerDark = darken(brand.secondaryColor, 10)

      const darkVars: Record<string, string> = {
        '--color-surface': surfaceDark,
        '--color-background': backgroundDark,
        '--color-text-primary': textPrimaryDark,
        '--color-text-secondary': textSecondaryDark,
        '--color-text-disabled': textDisabledDark,
        '--color-divider': dividerDark,
      }

      for (const [key, value] of Object.entries(darkVars)) {
        root.style.setProperty(key, value)
      }
    } else {
      root.removeAttribute('data-theme')
    }
  }, [isDark, brand])

  const toggleDark = () => setIsDark((prev) => !prev)

  return (
    <BrandContext.Provider value={{ brand, isDark, toggleDark }}>
      {children}
    </BrandContext.Provider>
  )
}

/** Access the current brand config and dark mode state. */
export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext)
  if (!ctx) {
    throw new Error('useBrand must be used inside <BrandProvider>')
  }
  return ctx
}
