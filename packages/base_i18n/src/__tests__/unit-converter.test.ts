import { describe, it, expect } from 'vitest'
import { toDisplayValue, toMetricValue, formatUnit, UNIT_LABELS } from '../units/unit-converter'

describe('toDisplayValue', () => {
  it('returns metric value unchanged in metric system', () => {
    expect(toDisplayValue(2.5, 'pressure', 'metric')).toBe(2.5)
    expect(toDisplayValue(10, 'flowRate', 'metric')).toBe(10)
  })

  it('converts bar to PSI', () => {
    expect(toDisplayValue(1, 'pressure', 'imperial')).toBeCloseTo(14.5038, 3)
  })

  it('converts L/min to GPM', () => {
    expect(toDisplayValue(1, 'flowRate', 'imperial')).toBeCloseTo(0.264172, 4)
  })

  it('converts litres to gallons', () => {
    expect(toDisplayValue(1, 'volume', 'imperial')).toBeCloseTo(0.264172, 4)
  })

  it('converts Celsius to Fahrenheit', () => {
    expect(toDisplayValue(0, 'temperature', 'imperial')).toBe(32)
    expect(toDisplayValue(100, 'temperature', 'imperial')).toBe(212)
    expect(toDisplayValue(-40, 'temperature', 'imperial')).toBe(-40)
  })
})

describe('toMetricValue', () => {
  it('converts PSI back to bar', () => {
    const bar = 2.5
    const psi = toDisplayValue(bar, 'pressure', 'imperial')
    expect(toMetricValue(psi, 'pressure')).toBeCloseTo(bar, 5)
  })

  it('converts GPM back to L/min', () => {
    const lpm = 15
    const gpm = toDisplayValue(lpm, 'flowRate', 'imperial')
    expect(toMetricValue(gpm, 'flowRate')).toBeCloseTo(lpm, 5)
  })

  it('converts Fahrenheit back to Celsius', () => {
    expect(toMetricValue(32, 'temperature')).toBeCloseTo(0, 5)
    expect(toMetricValue(212, 'temperature')).toBeCloseTo(100, 5)
  })
})

describe('formatUnit', () => {
  it('formats metric pressure', () => {
    expect(formatUnit(2.5, 'pressure', 'metric')).toBe('2.50 bar')
  })

  it('formats imperial pressure', () => {
    expect(formatUnit(1, 'pressure', 'imperial')).toBe('14.50 PSI')
  })

  it('respects decimals parameter', () => {
    expect(formatUnit(10, 'flowRate', 'metric', 0)).toBe('10 L/min')
  })
})

describe('UNIT_LABELS', () => {
  it('has labels for all quantities and systems', () => {
    const quantities = ['flowRate', 'pressure', 'volume', 'temperature'] as const
    const systems = ['metric', 'imperial'] as const
    for (const q of quantities) {
      for (const s of systems) {
        expect(typeof UNIT_LABELS[q][s]).toBe('string')
        expect(UNIT_LABELS[q][s].length).toBeGreaterThan(0)
      }
    }
  })
})
