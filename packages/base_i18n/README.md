# @web-base/base-i18n

Localisation, translations, RTL layout, and metric/imperial unit switching for web-base apps.

Supports five locales out of the box: **English**, **Polish**, **Japanese**, **Chinese**, **Arabic** (with automatic RTL). Both locale and unit system preferences are persisted to `localStorage`.

## Installation

```json
"@web-base/base-i18n": "github:krystianzajac/web-base#main&path=packages/base_i18n"
```

Add to `transpilePackages` in `next.config.mjs`:

```js
transpilePackages: ['@web-base/base-i18n']
```

## Quick start

### 1. Add providers

```tsx
// src/components/providers.tsx
import { LocaleProvider, UnitsProvider } from '@web-base/base-i18n'

export function Providers({ children }) {
  return (
    <LocaleProvider>
      <UnitsProvider>
        {children}
      </UnitsProvider>
    </LocaleProvider>
  )
}
```

### 2. Add translations

```tsx
'use client'
import { useTranslations } from '@web-base/base-i18n'

const translations = {
  en: { save: 'Save', cancel: 'Cancel' },
  pl: { save: 'Zapisz', cancel: 'Anuluj' },
  ar: { save: 'حفظ', cancel: 'إلغاء' },
} as const

export function ActionBar() {
  const { t } = useTranslations(translations)
  return <BaseButton>{t('save')}</BaseButton>
}
```

### 3. Display units

```tsx
'use client'
import { useUnits } from '@web-base/base-i18n'

export function PressureReading({ barValue }: { barValue: number }) {
  const { format } = useUnits()
  // metric: "2.50 bar"   imperial: "36.26 PSI"
  return <span>{format(barValue, 'pressure')}</span>
}
```

### 4. Language switcher

```tsx
import { LocaleSwitcher } from '@web-base/base-i18n'

<LocaleSwitcher className="rounded border p-1" />
// renders: English | Polski | 日本語 | 中文 | العربية
```

Switching to Arabic automatically sets `dir="rtl"` and `lang="ar"` on `<html>`.

## Key exports

| Export | Description |
|--------|-------------|
| `LocaleProvider` | Context provider — wraps app, manages locale state and sets `<html dir lang>` |
| `useLocale()` | `{ locale, setLocale, dir, isRTL }` |
| `useTranslations(map)` | `{ t(key) }` — type-safe, falls back to English |
| `LocaleSwitcher` | Drop-in `<select>` component |
| `UnitsProvider` | Context provider — manages unit system state |
| `useUnits()` | `{ unitSystem, setUnitSystem, convert, toMetric, format, label }` |
| `toDisplayValue(value, quantity, system)` | Pure conversion (no React) |
| `formatUnit(value, quantity, system)` | Pure formatter returning `"2.50 bar"` |
| `LOCALE_LABELS` | `{ en: 'English', pl: 'Polski', … }` |
| `UNIT_LABELS` | `{ flowRate: { metric: 'L/min', imperial: 'GPM' }, … }` |

## Supported locales

| Code | Language | Direction |
|------|----------|-----------|
| `en` | English | LTR |
| `pl` | Polski | LTR |
| `ja` | 日本語 | LTR |
| `zh` | 中文 | LTR |
| `ar` | العربية | **RTL** |

## Supported unit quantities

| Quantity | Metric | Imperial |
|----------|--------|----------|
| `flowRate` | L/min | GPM |
| `pressure` | bar | PSI |
| `volume` | L | gal |
| `temperature` | °C | °F |
