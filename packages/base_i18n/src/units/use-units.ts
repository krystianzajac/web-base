'use client'

import { useUnitsContext } from './units-context'
import {
  toDisplayValue,
  toMetricValue,
  formatUnit,
  UNIT_LABELS,
  type PhysicalQuantity,
} from './unit-converter'
import type { UnitSystem } from '../types/i18n-types'

/**
 * Returns the current unit system and helpers for converting and formatting values.
 * All app data should be stored in metric; use these helpers at the display layer only.
 *
 * @example
 * const { unitSystem, convert, format, label } = useUnits()
 *
 * // Display a pressure value from the API (stored in bar):
 * format(2.5, 'pressure')         // "2.50 bar" or "36.26 PSI"
 * convert(2.5, 'pressure')        // 2.5 or 36.26
 * label('pressure')               // "bar" or "PSI"
 */
export function useUnits() {
  const { unitSystem, setUnitSystem } = useUnitsContext()

  /** Convert a metric value to the current display unit system. */
  function convert(metricValue: number, quantity: PhysicalQuantity): number {
    return toDisplayValue(metricValue, quantity, unitSystem)
  }

  /** Convert a user-input value (in current unit system) back to metric for storage. */
  function toMetric(displayValue: number, quantity: PhysicalQuantity): number {
    if (unitSystem === 'metric') return displayValue
    return toMetricValue(displayValue, quantity)
  }

  /** Format a metric value as a localised string with unit label appended. */
  function format(metricValue: number, quantity: PhysicalQuantity, decimals?: number): string {
    return formatUnit(metricValue, quantity, unitSystem, decimals)
  }

  /** Return just the unit label for the current system. */
  function label(quantity: PhysicalQuantity): string {
    return UNIT_LABELS[quantity][unitSystem]
  }

  return {
    unitSystem,
    setUnitSystem,
    isMetric: unitSystem === 'metric',
    isImperial: unitSystem === 'imperial',
    convert,
    toMetric,
    format,
    label,
  }
}

export type { PhysicalQuantity, UnitSystem }
