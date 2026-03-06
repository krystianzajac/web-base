import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocaleProvider } from '../locale/locale-provider'
import { useLocale } from '../locale/use-locale'

function TestComponent() {
  const { locale, setLocale, dir, isRTL } = useLocale()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="rtl">{isRTL ? 'rtl' : 'ltr'}</span>
      <button onClick={() => setLocale('ar')}>Switch to Arabic</button>
      <button onClick={() => setLocale('pl')}>Switch to Polish</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('useLocale', () => {
  it('defaults to English LTR', () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('en')
    expect(screen.getByTestId('dir')).toHaveTextContent('ltr')
    expect(screen.getByTestId('rtl')).toHaveTextContent('ltr')
  })

  it('switches locale and persists to localStorage', async () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>,
    )
    await userEvent.click(screen.getByText('Switch to Polish'))
    expect(screen.getByTestId('locale')).toHaveTextContent('pl')
    expect(localStorage.getItem('web-base:locale')).toBe('pl')
  })

  it('sets RTL and dir=rtl when switching to Arabic', async () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>,
    )
    await userEvent.click(screen.getByText('Switch to Arabic'))
    expect(screen.getByTestId('locale')).toHaveTextContent('ar')
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl')
    expect(screen.getByTestId('rtl')).toHaveTextContent('rtl')
  })

  it('sets document.documentElement.dir on locale change', async () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>,
    )
    await userEvent.click(screen.getByText('Switch to Arabic'))
    expect(document.documentElement.dir).toBe('rtl')

    await userEvent.click(screen.getByText('Switch to Polish'))
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('respects initialLocale prop', () => {
    render(
      <LocaleProvider initialLocale="ja">
        <TestComponent />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('locale')).toHaveTextContent('ja')
  })
})
