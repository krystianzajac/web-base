import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LocaleProvider } from '../locale/locale-provider'
import { useTranslations } from '../translations/use-translations'

const translations = {
  en: { hello: 'Hello', save: 'Save' },
  pl: { hello: 'Cześć', save: 'Zapisz' },
  ar: { hello: 'مرحبا', save: 'حفظ' },
} as const

function TestComponent() {
  const { t } = useTranslations(translations)
  return (
    <div>
      <span data-testid="hello">{t('hello')}</span>
      <span data-testid="save">{t('save')}</span>
    </div>
  )
}

describe('useTranslations', () => {
  it('returns English strings by default', () => {
    render(
      <LocaleProvider initialLocale="en">
        <TestComponent />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('hello')).toHaveTextContent('Hello')
    expect(screen.getByTestId('save')).toHaveTextContent('Save')
  })

  it('returns Polish strings for pl locale', () => {
    render(
      <LocaleProvider initialLocale="pl">
        <TestComponent />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('hello')).toHaveTextContent('Cześć')
    expect(screen.getByTestId('save')).toHaveTextContent('Zapisz')
  })

  it('returns Arabic strings for ar locale', () => {
    render(
      <LocaleProvider initialLocale="ar">
        <TestComponent />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('hello')).toHaveTextContent('مرحبا')
  })

  it('falls back to English for a locale with no translation', () => {
    render(
      <LocaleProvider initialLocale="ja">
        <TestComponent />
      </LocaleProvider>,
    )
    // Japanese not in the map → falls back to English
    expect(screen.getByTestId('hello')).toHaveTextContent('Hello')
  })
})
