/**
 * Lightweight hex colour manipulation utilities.
 * No external dependencies — keeps the bundle lean.
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}

/** Darken a hex colour by a percentage (0-100). */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const f = 1 - amount / 100
  return rgbToHex(Math.round(r * f), Math.round(g * f), Math.round(b * f))
}

/** Lighten a hex colour by a percentage (0-100). */
export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const f = amount / 100
  return rgbToHex(
    Math.round(r + (255 - r) * f),
    Math.round(g + (255 - g) * f),
    Math.round(b + (255 - b) * f),
  )
}

/** Convert hex to "r g b" string for Tailwind opacity modifiers. */
export function hexToRgbChannels(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  return `${r} ${g} ${b}`
}
