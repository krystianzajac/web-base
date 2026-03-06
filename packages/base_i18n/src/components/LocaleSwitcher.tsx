'use client'

import { useLocaleContext } from '../locale/locale-context'
import { LOCALE_LABELS, type SupportedLocale } from '../types/i18n-types'

interface LocaleSwitcherProps {
  /** aria-label for the select element. Defaults to "Select language". */
  label?: string
  className?: string
}

/**
 * A language-switcher select showing each language name in its own script.
 * Switching to Arabic automatically flips the interface to RTL.
 *
 * @example
 * <LocaleSwitcher />
 * <LocaleSwitcher label="Sprache wählen" className="my-2" />
 */
export function LocaleSwitcher({ label = 'Select language', className }: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocaleContext()

  return (
    <select
      aria-label={label}
      value={locale}
      onChange={(e) => setLocale(e.target.value as SupportedLocale)}
      className={className}
    >
      {(Object.entries(LOCALE_LABELS) as [SupportedLocale, string][]).map(([code, name]) => (
        <option key={code} value={code} lang={code}>
          {name}
        </option>
      ))}
    </select>
  )
}
