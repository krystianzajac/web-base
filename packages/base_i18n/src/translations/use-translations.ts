'use client'

import { useLocaleContext } from '../locale/locale-context'
import type { SupportedLocale, TranslationMap } from '../types/i18n-types'

/**
 * Returns a typed `t()` function scoped to the provided translation map.
 * Falls back to English if the current locale has no entry.
 *
 * @example
 * const translations = {
 *   en: { hello: 'Hello', save: 'Save' },
 *   pl: { hello: 'Cześć', save: 'Zapisz' },
 *   ar: { hello: 'مرحبا', save: 'حفظ' },
 * } as const
 *
 * function MyComponent() {
 *   const { t } = useTranslations(translations)
 *   return <p>{t('hello')}</p>
 * }
 */
export function useTranslations<T extends Record<string, string>>(
  translations: TranslationMap<T>,
): { t: (key: keyof T) => string; locale: SupportedLocale } {
  const { locale } = useLocaleContext()

  const map = (translations[locale] ?? translations['en']) as T

  function t(key: keyof T): string {
    return map[key] ?? (translations['en'][key] as string) ?? String(key)
  }

  return { t, locale }
}
