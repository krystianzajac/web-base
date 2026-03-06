'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { LocaleContext } from './locale-context'
import {
  RTL_LOCALES,
  LOCALE_HTML_LANG,
  type SupportedLocale,
  type TextDirection,
} from '../types/i18n-types'

const STORAGE_KEY = 'web-base:locale'
const DEFAULT_LOCALE: SupportedLocale = 'en'
const VALID_LOCALES: SupportedLocale[] = ['en', 'pl', 'ja', 'zh', 'ar']

function getStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && VALID_LOCALES.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale
  }
  return DEFAULT_LOCALE
}

interface LocaleProviderProps {
  children: ReactNode
  /** Override the initial locale (e.g. from server-side cookie). Falls back to localStorage. */
  initialLocale?: SupportedLocale
}

/**
 * Provides locale context to the app. Place this near the root of your component tree.
 * Automatically sets `lang` and `dir` on <html> when locale changes.
 */
export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  // Lazy initializer reads localStorage only on the client; server returns DEFAULT_LOCALE.
  const [locale, setLocaleState] = useState<SupportedLocale>(
    () => initialLocale ?? getStoredLocale(),
  )

  // Apply lang + dir to <html> on every locale change
  useEffect(() => {
    const dir: TextDirection = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'
    document.documentElement.lang = LOCALE_HTML_LANG[locale]
    document.documentElement.dir = dir
  }, [locale])

  const setLocale = useCallback((next: SupportedLocale) => {
    localStorage.setItem(STORAGE_KEY, next)
    setLocaleState(next)
  }, [])

  const isRTL = RTL_LOCALES.includes(locale)
  const dir: TextDirection = isRTL ? 'rtl' : 'ltr'

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dir, isRTL }}>
      {children}
    </LocaleContext.Provider>
  )
}
