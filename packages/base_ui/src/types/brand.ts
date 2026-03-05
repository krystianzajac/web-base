/**
 * Brand configuration — the single source of truth for all design tokens.
 * Each app supplies one of these; web-base generates everything from it.
 */
export interface AppBrand {
  /** Human-readable app name */
  name: string
  /** Primary brand colour (hex, e.g. "#6C63FF") */
  primaryColor: string
  /** Secondary colour (hex) */
  secondaryColor: string
  /** Error / destructive colour (hex) */
  errorColor: string
  /** Success / positive colour (hex) */
  successColor: string
  /** Warning / caution colour (hex) */
  warningColor: string
  /** Typography settings */
  fonts: {
    heading: string
    body: string
    mono: string
  }
  /** Logo URL or local path */
  logo: string
  /** Spacing density */
  spacing: 'standard' | 'compact'
  /** Border-radius style */
  radius: 'sharp' | 'medium' | 'rounded'
}
