import type { AppBrand } from '../types/brand'
import { darken, lighten, hexToRgbChannels } from './color-utils'

interface BrandTokens {
  light: Record<string, string>
  dark: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, string>
  radius: Record<string, string>
  fontSize: Record<string, [string, { lineHeight: string; fontWeight?: string }]>
  transitionDuration: Record<string, string>
}

function computeTokens(brand: AppBrand): BrandTokens {
  const radiusMap = { sharp: '2px', medium: '8px', rounded: '16px' }

  return {
    light: {
      '--color-primary': brand.primaryColor,
      '--color-secondary': brand.secondaryColor,
      '--color-error': brand.errorColor,
      '--color-success': brand.successColor,
      '--color-warning': brand.warningColor,
      '--color-surface': lighten(brand.secondaryColor, 90),
      '--color-background': lighten(brand.secondaryColor, 95),
      '--color-text-primary': darken(brand.secondaryColor, 10),
      '--color-text-secondary': lighten(brand.secondaryColor, 20),
      '--color-text-disabled': lighten(brand.secondaryColor, 60),
      '--color-divider': lighten(brand.secondaryColor, 75),
    },
    dark: {
      '--color-primary': brand.primaryColor,
      '--color-secondary': brand.secondaryColor,
      '--color-error': brand.errorColor,
      '--color-success': brand.successColor,
      '--color-warning': brand.warningColor,
      '--color-surface': darken(brand.secondaryColor, 20),
      '--color-background': darken(brand.secondaryColor, 40),
      '--color-text-primary': lighten(brand.secondaryColor, 90),
      '--color-text-secondary': lighten(brand.secondaryColor, 70),
      '--color-text-disabled': lighten(brand.secondaryColor, 40),
      '--color-divider': darken(brand.secondaryColor, 10),
    },
    fonts: {
      '--font-heading': `'${brand.fonts.heading}', sans-serif`,
      '--font-body': `'${brand.fonts.body}', sans-serif`,
      '--font-mono': `'${brand.fonts.mono}', monospace`,
    },
    spacing: {
      '--spacing-xs': '4px',
      '--spacing-sm': '8px',
      '--spacing-md': '16px',
      '--spacing-lg': '24px',
      '--spacing-xl': '32px',
      '--spacing-xxl': '48px',
    },
    radius: {
      '--radius-sharp': '2px',
      '--radius-medium': '8px',
      '--radius-rounded': '16px',
      '--radius-full': '9999px',
      '--radius-default': radiusMap[brand.radius],
    },
    fontSize: {
      '--text-display-large': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
      '--text-display-medium': ['2.8rem', { lineHeight: '1.15', fontWeight: '700' }],
      '--text-display-small': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
      '--text-headline-large': ['2rem', { lineHeight: '1.25', fontWeight: '600' }],
      '--text-headline-medium': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
      '--text-headline-small': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
      '--text-title-large': ['1.375rem', { lineHeight: '1.4', fontWeight: '500' }],
      '--text-title-medium': ['1.25rem', { lineHeight: '1.45', fontWeight: '500' }],
      '--text-title-small': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
      '--text-body-large': ['1rem', { lineHeight: '1.6' }],
      '--text-body-medium': ['0.9375rem', { lineHeight: '1.6' }],
      '--text-body-small': ['0.875rem', { lineHeight: '1.6' }],
      '--text-label-large': ['0.9375rem', { lineHeight: '1.4', fontWeight: '500' }],
      '--text-label-medium': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
      '--text-label-small': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
    },
    transitionDuration: {
      '--duration-fast': '150ms',
      '--duration-normal': '300ms',
      '--duration-slow': '500ms',
    },
  }
}

/**
 * Generates CSS custom properties from an AppBrand config.
 *
 * Works with any Tailwind version (or no Tailwind at all).
 * Inject the returned string into a <style> tag or a global CSS file.
 *
 * @example
 * ```css
 * // In your global CSS:
 * ${generateBrandCSS(brand)}
 * ```
 */
export function generateBrandCSS(brand: AppBrand): string {
  const tokens = computeTokens(brand)
  const lines: string[] = []

  lines.push(':root {')
  for (const [k, v] of Object.entries(tokens.light)) {
    lines.push(`  ${k}: ${v};`)
  }
  for (const [k, v] of Object.entries(tokens.fonts)) {
    lines.push(`  ${k}: ${v};`)
  }
  for (const [k, v] of Object.entries(tokens.spacing)) {
    lines.push(`  ${k}: ${v};`)
  }
  for (const [k, v] of Object.entries(tokens.radius)) {
    lines.push(`  ${k}: ${v};`)
  }
  for (const [k, v] of Object.entries(tokens.transitionDuration)) {
    lines.push(`  ${k}: ${v};`)
  }
  lines.push('}')
  lines.push('')
  lines.push('[data-theme="dark"] {')
  for (const [k, v] of Object.entries(tokens.dark)) {
    lines.push(`  ${k}: ${v};`)
  }
  lines.push('}')

  return lines.join('\n')
}

/**
 * Generates a Tailwind v4 `@theme` block from an AppBrand config.
 *
 * Tailwind v4 uses CSS-first config — no `tailwind.config.ts`.
 * Paste the returned string into your main CSS file alongside
 * `@import "tailwindcss"`.
 *
 * @example
 * ```css
 * @import "tailwindcss";
 *
 * ${generateTailwindV4Theme(brand)}
 *
 * ${generateBrandCSS(brand)}
 * ```
 */
export function generateTailwindV4Theme(brand: AppBrand): string {
  const tokens = computeTokens(brand)
  const lines: string[] = []

  lines.push('@theme {')

  // Colors — reference CSS variables so dark mode works automatically
  lines.push('  --color-primary: var(--color-primary);')
  lines.push('  --color-secondary: var(--color-secondary);')
  lines.push('  --color-error: var(--color-error);')
  lines.push('  --color-success: var(--color-success);')
  lines.push('  --color-warning: var(--color-warning);')
  lines.push('  --color-surface: var(--color-surface);')
  lines.push('  --color-background: var(--color-background);')
  lines.push('  --color-text-primary: var(--color-text-primary);')
  lines.push('  --color-text-secondary: var(--color-text-secondary);')
  lines.push('  --color-text-disabled: var(--color-text-disabled);')
  lines.push('  --color-divider: var(--color-divider);')

  // Fonts
  lines.push(`  --font-heading: '${brand.fonts.heading}', sans-serif;`)
  lines.push(`  --font-body: '${brand.fonts.body}', sans-serif;`)
  lines.push(`  --font-mono: '${brand.fonts.mono}', monospace;`)

  // Spacing
  for (const [k, v] of Object.entries(tokens.spacing)) {
    const name = k.replace('--spacing-', '--spacing-')
    lines.push(`  ${name}: ${v};`)
  }

  // Radius
  for (const [k, v] of Object.entries(tokens.radius)) {
    const name = k.replace('--radius-', '--radius-')
    lines.push(`  ${name}: ${v};`)
  }

  // Transition durations
  for (const [k, v] of Object.entries(tokens.transitionDuration)) {
    lines.push(`  ${k}: ${v};`)
  }

  lines.push('}')

  return lines.join('\n')
}
