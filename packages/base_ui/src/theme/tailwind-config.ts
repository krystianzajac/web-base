import type { AppBrand } from '../types/brand'
import { darken, lighten } from './color-utils'

/**
 * Generates a Tailwind CSS config object from an AppBrand.
 * Inject the result into tailwind.config.ts as the base config.
 */
export function createTailwindConfig(brand: AppBrand): object {
  const surfaceLight = lighten(brand.secondaryColor, 90)
  const backgroundLight = lighten(brand.secondaryColor, 95)
  const textPrimary = darken(brand.secondaryColor, 10)
  const textSecondary = lighten(brand.secondaryColor, 20)
  const textDisabled = lighten(brand.secondaryColor, 60)
  const divider = lighten(brand.secondaryColor, 75)

  const surfaceDark = darken(brand.secondaryColor, 20)
  const backgroundDark = darken(brand.secondaryColor, 40)
  const textPrimaryDark = lighten(brand.secondaryColor, 90)
  const textSecondaryDark = lighten(brand.secondaryColor, 70)
  const textDisabledDark = lighten(brand.secondaryColor, 40)
  const dividerDark = darken(brand.secondaryColor, 10)

  const radiusMap = {
    sharp: '2px',
    medium: '8px',
    rounded: '16px',
  }

  return {
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
      extend: {
        colors: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          error: 'var(--color-error)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          surface: 'var(--color-surface)',
          background: 'var(--color-background)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-disabled': 'var(--color-text-disabled)',
          divider: 'var(--color-divider)',
        },
        fontFamily: {
          heading: [brand.fonts.heading, 'sans-serif'],
          body: [brand.fonts.body, 'sans-serif'],
          mono: [brand.fonts.mono, 'monospace'],
        },
        fontSize: {
          'display-large': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
          'display-medium': ['2.8rem', { lineHeight: '1.15', fontWeight: '700' }],
          'display-small': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
          'headline-large': ['2rem', { lineHeight: '1.25', fontWeight: '600' }],
          'headline-medium': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
          'headline-small': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
          'title-large': ['1.375rem', { lineHeight: '1.4', fontWeight: '500' }],
          'title-medium': ['1.25rem', { lineHeight: '1.45', fontWeight: '500' }],
          'title-small': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
          'body-large': ['1rem', { lineHeight: '1.6' }],
          'body-medium': ['0.9375rem', { lineHeight: '1.6' }],
          'body-small': ['0.875rem', { lineHeight: '1.6' }],
          'label-large': ['0.9375rem', { lineHeight: '1.4', fontWeight: '500' }],
          'label-medium': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
          'label-small': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px',
          xxl: '48px',
        },
        borderRadius: {
          sharp: '2px',
          medium: '8px',
          rounded: '16px',
          full: '9999px',
          DEFAULT: radiusMap[brand.radius],
        },
        transitionDuration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms',
        },
      },
    },
    plugins: [
      // CSS variables injected at :root via BrandProvider — not here.
      // This block documents what those variables will be.
      // Light mode defaults: --color-primary: brand.primaryColor, etc.
      // Dark mode overrides in [data-theme="dark"]
      {
        handler: ({ addBase }: { addBase: (styles: Record<string, Record<string, string>>) => void }) => {
          addBase({
            ':root': {
              '--color-primary': brand.primaryColor,
              '--color-secondary': brand.secondaryColor,
              '--color-error': brand.errorColor,
              '--color-success': brand.successColor,
              '--color-warning': brand.warningColor,
              '--color-surface': surfaceLight,
              '--color-background': backgroundLight,
              '--color-text-primary': textPrimary,
              '--color-text-secondary': textSecondary,
              '--color-text-disabled': textDisabled,
              '--color-divider': divider,
            },
            '[data-theme="dark"]': {
              '--color-primary': brand.primaryColor,
              '--color-secondary': brand.secondaryColor,
              '--color-error': brand.errorColor,
              '--color-success': brand.successColor,
              '--color-warning': brand.warningColor,
              '--color-surface': surfaceDark,
              '--color-background': backgroundDark,
              '--color-text-primary': textPrimaryDark,
              '--color-text-secondary': textSecondaryDark,
              '--color-text-disabled': textDisabledDark,
              '--color-divider': dividerDark,
            },
          })
        },
      },
    ],
  }
}
