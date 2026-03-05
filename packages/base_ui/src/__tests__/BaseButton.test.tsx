import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BaseButton } from '../components/BaseButton'

describe('BaseButton', () => {
  it('renders with default props', () => {
    render(<BaseButton>Click me</BaseButton>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies aria-label when provided', () => {
    render(<BaseButton aria-label="Submit form">Submit</BaseButton>)
    expect(screen.getByRole('button', { name: 'Submit form' })).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<BaseButton disabled>Click me</BaseButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner and is disabled when loading', () => {
    render(<BaseButton loading>Click me</BaseButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    // Spinner is aria-hidden; loading is communicated via aria-busy on the button.
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<BaseButton onClick={onClick}>Click me</BaseButton>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<BaseButton disabled onClick={onClick}>Click me</BaseButton>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it.each(['primary', 'secondary', 'tertiary', 'destructive'] as const)(
    'renders %s variant without error',
    (variant) => {
      render(<BaseButton variant={variant}>{variant}</BaseButton>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    },
  )
})
