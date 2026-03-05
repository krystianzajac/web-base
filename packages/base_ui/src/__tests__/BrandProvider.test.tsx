import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { BrandProvider, useBrand } from '../theme/brand-provider'
import type { AppBrand } from '../types/brand'

const testBrand: AppBrand = {
  name: 'Test App',
  primaryColor: '#6C63FF',
  secondaryColor: '#2D2D2D',
  errorColor: '#E53935',
  successColor: '#43A047',
  warningColor: '#FFA726',
  fonts: { heading: 'Inter', body: 'Inter', mono: 'Mono' },
  logo: '/logo.svg',
  spacing: 'standard',
  radius: 'medium',
}

function ConsumerComponent() {
  const { brand, isDark, toggleDark } = useBrand()
  return (
    <div>
      <span data-testid="brand-name">{brand.name}</span>
      <span data-testid="dark-mode">{isDark ? 'dark' : 'light'}</span>
      <button onClick={toggleDark}>Toggle dark</button>
    </div>
  )
}

describe('BrandProvider', () => {
  it('provides brand config to children', () => {
    render(
      <BrandProvider brand={testBrand}>
        <ConsumerComponent />
      </BrandProvider>,
    )
    expect(screen.getByTestId('brand-name')).toHaveTextContent('Test App')
  })

  it('starts in light mode', () => {
    render(
      <BrandProvider brand={testBrand}>
        <ConsumerComponent />
      </BrandProvider>,
    )
    expect(screen.getByTestId('dark-mode')).toHaveTextContent('light')
  })

  it('toggles dark mode', async () => {
    render(
      <BrandProvider brand={testBrand}>
        <ConsumerComponent />
      </BrandProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Toggle dark' }))
    expect(screen.getByTestId('dark-mode')).toHaveTextContent('dark')
  })

  it('injects CSS variables into document root', async () => {
    render(
      <BrandProvider brand={testBrand}>
        <div>child</div>
      </BrandProvider>,
    )
    // CSS variables are applied via useEffect — wait for them
    await act(async () => {})
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#6C63FF')
  })

  it('throws when useBrand is used outside BrandProvider', () => {
    const OriginalConsole = console.error
    console.error = () => {}
    expect(() => {
      render(<ConsumerComponent />)
    }).toThrow('useBrand must be used inside <BrandProvider>')
    console.error = OriginalConsole
  })
})
