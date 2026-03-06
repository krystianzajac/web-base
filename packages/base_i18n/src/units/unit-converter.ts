import type { UnitSystem } from '../types/i18n-types'

/** Physical quantity types supported by the unit converter. */
export type PhysicalQuantity = 'flowRate' | 'pressure' | 'volume' | 'temperature'

/** Unit labels per quantity per system. */
export const UNIT_LABELS: Record<PhysicalQuantity, Record<UnitSystem, string>> = {
  flowRate: { metric: 'L/min', imperial: 'GPM' },
  pressure: { metric: 'bar', imperial: 'PSI' },
  volume: { metric: 'L', imperial: 'gal' },
  temperature: { metric: '°C', imperial: '°F' },
}

// Conversion factors (metric → imperial)
const L_PER_MIN_TO_GPM = 0.264172
const BAR_TO_PSI = 14.5038
const L_TO_GAL = 0.264172

/**
 * Convert a value from metric to imperial (or return as-is for metric).
 * All internal values are stored in metric units.
 */
export function toDisplayValue(
  metricValue: number,
  quantity: PhysicalQuantity,
  system: UnitSystem,
): number {
  if (system === 'metric') return metricValue

  switch (quantity) {
    case 'flowRate':
      return metricValue * L_PER_MIN_TO_GPM
    case 'pressure':
      return metricValue * BAR_TO_PSI
    case 'volume':
      return metricValue * L_TO_GAL
    case 'temperature':
      return (metricValue * 9) / 5 + 32
  }
}

/**
 * Convert a user-entered imperial value back to metric for storage.
 */
export function toMetricValue(
  imperialValue: number,
  quantity: PhysicalQuantity,
): number {
  switch (quantity) {
    case 'flowRate':
      return imperialValue / L_PER_MIN_TO_GPM
    case 'pressure':
      return imperialValue / BAR_TO_PSI
    case 'volume':
      return imperialValue / L_TO_GAL
    case 'temperature':
      return ((imperialValue - 32) * 5) / 9
  }
}

/**
 * Format a metric value for display: converts if needed and appends unit label.
 *
 * @example
 * formatUnit(2.5, 'pressure', 'imperial') // "36.26 PSI"
 * formatUnit(2.5, 'pressure', 'metric')   // "2.5 bar"
 */
export function formatUnit(
  metricValue: number,
  quantity: PhysicalQuantity,
  system: UnitSystem,
  decimals = 2,
): string {
  const value = toDisplayValue(metricValue, quantity, system)
  const label = UNIT_LABELS[quantity][system]
  return `${value.toFixed(decimals)} ${label}`
}
