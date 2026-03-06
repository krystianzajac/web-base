import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnitsProvider } from '../units/units-provider'
import { useUnits } from '../units/use-units'

function TestComponent() {
  const { unitSystem, setUnitSystem, isMetric, isImperial, convert, format, label } = useUnits()
  const pressure = 2.5
  return (
    <div>
      <span data-testid="system">{unitSystem}</span>
      <span data-testid="is-metric">{isMetric ? 'yes' : 'no'}</span>
      <span data-testid="is-imperial">{isImperial ? 'yes' : 'no'}</span>
      <span data-testid="pressure">{convert(pressure, 'pressure').toFixed(2)}</span>
      <span data-testid="formatted">{format(pressure, 'pressure')}</span>
      <span data-testid="label">{label('pressure')}</span>
      <button onClick={() => setUnitSystem('imperial')}>Switch to Imperial</button>
      <button onClick={() => setUnitSystem('metric')}>Switch to Metric</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('useUnits', () => {
  it('defaults to metric', () => {
    render(
      <UnitsProvider>
        <TestComponent />
      </UnitsProvider>,
    )
    expect(screen.getByTestId('system')).toHaveTextContent('metric')
    expect(screen.getByTestId('is-metric')).toHaveTextContent('yes')
    expect(screen.getByTestId('is-imperial')).toHaveTextContent('no')
    expect(screen.getByTestId('pressure')).toHaveTextContent('2.50')
    expect(screen.getByTestId('label')).toHaveTextContent('bar')
  })

  it('switches to imperial and converts values', async () => {
    render(
      <UnitsProvider>
        <TestComponent />
      </UnitsProvider>,
    )
    await userEvent.click(screen.getByText('Switch to Imperial'))
    expect(screen.getByTestId('system')).toHaveTextContent('imperial')
    expect(screen.getByTestId('is-imperial')).toHaveTextContent('yes')
    // 2.5 bar = 36.26 PSI
    expect(screen.getByTestId('pressure')).toHaveTextContent('36.26')
    expect(screen.getByTestId('label')).toHaveTextContent('PSI')
  })

  it('persists unit system to localStorage', async () => {
    render(
      <UnitsProvider>
        <TestComponent />
      </UnitsProvider>,
    )
    await userEvent.click(screen.getByText('Switch to Imperial'))
    expect(localStorage.getItem('web-base:unit-system')).toBe('imperial')
  })

  it('respects initialSystem prop', () => {
    render(
      <UnitsProvider initialSystem="imperial">
        <TestComponent />
      </UnitsProvider>,
    )
    expect(screen.getByTestId('system')).toHaveTextContent('imperial')
  })
})
