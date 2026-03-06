/** The five supported locales. */
export type SupportedLocale = 'en' | 'pl' | 'ja' | 'zh' | 'ar'

/** Text direction derived from locale. */
export type TextDirection = 'ltr' | 'rtl'

/** Metric or imperial unit system. */
export type UnitSystem = 'metric' | 'imperial'

/** Locales that use right-to-left text direction. */
export const RTL_LOCALES: readonly SupportedLocale[] = ['ar']

/** All supported locales with their display names (in their own script). */
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  pl: 'Polski',
  ja: '日本語',
  zh: '中文',
  ar: 'العربية',
}

/** HTML lang attribute values for each locale. */
export const LOCALE_HTML_LANG: Record<SupportedLocale, string> = {
  en: 'en',
  pl: 'pl',
  ja: 'ja',
  zh: 'zh',
  ar: 'ar',
}

/**
 * A translation map. English (`en`) is required as the fallback; other locales are optional.
 * T captures the English key shape for type-safe `t(key)` lookups.
 * Other locales only need to share the same keys — their values can be any string.
 *
 * @example
 * const translations = {
 *   en: { save: 'Save', cancel: 'Cancel' },
 *   pl: { save: 'Zapisz', cancel: 'Anuluj' },
 * } satisfies TranslationMap<{ save: string; cancel: string }>
 */
export type TranslationMap<T extends Record<string, string>> = {
  en: T
} & {
  [L in Exclude<SupportedLocale, 'en'>]?: Record<keyof T, string>
}

/** Locale context value. */
export interface LocaleContextValue {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  dir: TextDirection
  isRTL: boolean
}

/** Units context value. */
export interface UnitsContextValue {
  unitSystem: UnitSystem
  setUnitSystem: (system: UnitSystem) => void
}
