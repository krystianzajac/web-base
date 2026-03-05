import type { AppBrand } from '@web-base/base-ui'

/**
 * Garish brand config — intentionally loud colours to prove all tokens come
 * from this object and nothing is hardcoded in the components.
 */
export const exampleBrand: AppBrand = {
  name: 'Example App',
  primaryColor: '#FF0099',    // hot pink — proves primary token is from config
  secondaryColor: '#1A1A3E',  // deep navy
  errorColor: '#FF3B30',
  successColor: '#34C759',
  warningColor: '#FF9500',
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  logo: '/assets/logo.svg',
  spacing: 'standard',
  radius: 'medium',
}
