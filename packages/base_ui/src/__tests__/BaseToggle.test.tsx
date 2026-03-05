import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BaseToggle } from '../components/BaseToggle'

describe('BaseToggle', () => {
  it('renders with label', () => {
    render(<BaseToggle label="Enable notifications" checked={false} onChange={() => {}} />)
    expect(screen.getByText('Enable notifications')).toBeInTheDocument()
  })

  it('renders the switch control with accessible role', () => {
    render(<BaseToggle label="Dark mode" checked={false} onChange={() => {}} />)
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument()
  })

  it('reflects checked state', () => {
    render(<BaseToggle label="Toggle" checked={true} onChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange when toggled', async () => {
    const onChange = vi.fn()
    render(<BaseToggle label="Toggle" checked={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled prop is true', () => {
    render(<BaseToggle label="Toggle" checked={false} onChange={() => {}} disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('shows helper text when provided', () => {
    render(
      <BaseToggle
        label="Toggle"
        checked={false}
        onChange={() => {}}
        helperText="You can change this any time"
      />,
    )
    expect(screen.getByText('You can change this any time')).toBeInTheDocument()
  })
})
