import { describe, it, expect } from 'vitest'
import { generateBrandCSS, generateTailwindV4Theme } from '../theme/brand-css'
import { createTailwindConfig } from '../theme/tailwind-config'
import type { AppBrand } from '../types/brand'

const testBrand: AppBrand = {
  name: 'Test App',
  primaryColor: '#6C63FF',
  secondaryColor: '#2D2D2D',
  errorColor: '#E53935',
  successColor: '#43A047',
  warningColor: '#FFA726',
  fonts: { heading: 'Inter', body: 'Inter', mono: 'Fira Code' },
  logo: '/logo.svg',
  spacing: 'standard',
  radius: 'medium',
}

const requiredCSSVariables = [
  '--color-primary',
  '--color-secondary',
  '--color-error',
  '--color-success',
  '--color-warning',
  '--color-surface',
  '--color-background',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-disabled',
  '--color-divider',
]

describe('generateBrandCSS', () => {
  it('generates all required CSS custom properties in :root', () => {
    const css = generateBrandCSS(testBrand)
    for (const variable of requiredCSSVariables) {
      expect(css).toContain(variable)
    }
  })

  it('includes dark mode overrides', () => {
    const css = generateBrandCSS(testBrand)
    expect(css).toContain('[data-theme="dark"]')
  })

  it('includes font family variables', () => {
    const css = generateBrandCSS(testBrand)
    expect(css).toContain('--font-heading')
    expect(css).toContain('--font-body')
    expect(css).toContain('--font-mono')
    expect(css).toContain('Inter')
    expect(css).toContain('Fira Code')
  })

  it('includes spacing tokens', () => {
    const css = generateBrandCSS(testBrand)
    expect(css).toContain('--spacing-xs: 4px')
    expect(css).toContain('--spacing-sm: 8px')
    expect(css).toContain('--spacing-md: 16px')
    expect(css).toContain('--spacing-lg: 24px')
    expect(css).toContain('--spacing-xl: 32px')
    expect(css).toContain('--spacing-xxl: 48px')
  })

  it('includes radius tokens', () => {
    const css = generateBrandCSS(testBrand)
    expect(css).toContain('--radius-default: 8px')
    expect(css).toContain('--radius-full: 9999px')
  })

  it('uses the brand primary color', () => {
    const css = generateBrandCSS(testBrand)
    expect(css).toContain('#6C63FF')
  })

  it('respects radius config', () => {
    const sharp = generateBrandCSS({ ...testBrand, radius: 'sharp' })
    expect(sharp).toContain('--radius-default: 2px')

    const rounded = generateBrandCSS({ ...testBrand, radius: 'rounded' })
    expect(rounded).toContain('--radius-default: 16px')
  })
})

describe('generateTailwindV4Theme', () => {
  it('generates a @theme block', () => {
    const theme = generateTailwindV4Theme(testBrand)
    expect(theme).toMatch(/^@theme \{/)
    expect(theme).toMatch(/\}$/)
  })

  it('references CSS variables for colors (not hardcoded values)', () => {
    const theme = generateTailwindV4Theme(testBrand)
    expect(theme).toContain('--color-primary: var(--color-primary)')
    expect(theme).toContain('--color-error: var(--color-error)')
  })

  it('includes font families', () => {
    const theme = generateTailwindV4Theme(testBrand)
    expect(theme).toContain('--font-heading')
    expect(theme).toContain('Inter')
  })

  it('includes spacing tokens', () => {
    const theme = generateTailwindV4Theme(testBrand)
    expect(theme).toContain('--spacing-xs: 4px')
    expect(theme).toContain('--spacing-xxl: 48px')
  })

  it('includes radius tokens', () => {
    const theme = generateTailwindV4Theme(testBrand)
    expect(theme).toContain('--radius-default')
  })
})

describe('v3/v4 token parity', () => {
  it('v3 config and v4 CSS define the same color tokens', () => {
    const v3 = createTailwindConfig(testBrand) as {
      theme: { extend: { colors: Record<string, string> } }
    }
    const v4 = generateTailwindV4Theme(testBrand)

    const v3Colors = Object.keys(v3.theme.extend.colors)
    for (const colorName of v3Colors) {
      const cssVar = `--color-${colorName}`
      expect(v4).toContain(cssVar)
    }
  })

  it('v3 config and CSS generator define the same spacing tokens', () => {
    const v3 = createTailwindConfig(testBrand) as {
      theme: { extend: { spacing: Record<string, string> } }
    }
    const css = generateBrandCSS(testBrand)

    for (const [name, value] of Object.entries(v3.theme.extend.spacing)) {
      expect(css).toContain(`--spacing-${name}: ${value}`)
    }
  })

  it('v3 config and CSS generator define the same radius tokens', () => {
    const v3 = createTailwindConfig(testBrand) as {
      theme: { extend: { borderRadius: Record<string, string> } }
    }
    const css = generateBrandCSS(testBrand)

    for (const [name, value] of Object.entries(v3.theme.extend.borderRadius)) {
      if (name === 'DEFAULT') {
        expect(css).toContain(`--radius-default: ${value}`)
      } else {
        expect(css).toContain(`--radius-${name}: ${value}`)
      }
    }
  })
})
