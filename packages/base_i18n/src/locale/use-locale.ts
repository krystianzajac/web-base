'use client'

import { useLocaleContext } from './locale-context'

/**
 * Returns the current locale, a setter, and RTL helpers.
 *
 * @example
 * const { locale, setLocale, isRTL, dir } = useLocale()
 */
export function useLocale() {
  return useLocaleContext()
}
