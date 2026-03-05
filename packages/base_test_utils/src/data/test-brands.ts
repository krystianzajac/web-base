import type { AppBrand } from '@web-base/base-ui'

const base: AppBrand = {
  name: 'Test App',
  primaryColor: '#FF0099',
  secondaryColor: '#00FF00',
  errorColor: '#FF0000',
  successColor: '#00CC00',
  warningColor: '#FF9900',
  fonts: { heading: 'Inter', body: 'Inter', mono: 'monospace' },
  logo: '/test-logo.svg',
  spacing: 'standard',
  radius: 'medium',
}

/**
 * Pre-built brand configs for testing. Use garish colours to prove theming
 * tokens are applied rather than hardcoded values.
 *
 * @example
 * ```tsx
 * renderWithBrand(<MyComponent />, { brand: TestBrands.dark })
 * ```
 */
export const TestBrands = {
  /** Garish colours — proves brand tokens are wired up correctly. */
  plain: {
    ...base,
    name: 'Plain Test App',
  } satisfies AppBrand,

  /** Dark colour scheme for dark-mode tests. */
  dark: {
    ...base,
    name: 'Dark Test App',
    primaryColor: '#A0A0FF',
    secondaryColor: '#1A1A2E',
  } satisfies AppBrand,

  /** Compact spacing for density tests. */
  compact: {
    ...base,
    name: 'Compact Test App',
    spacing: 'compact',
  } satisfies AppBrand,
}
