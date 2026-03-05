import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BaseAlert } from '../components/BaseAlert'

describe('BaseAlert', () => {
  it('renders title and description', () => {
    render(<BaseAlert title="Success" description="Action completed." />)
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Action completed.')).toBeInTheDocument()
  })

  it('has alert role', () => {
    render(<BaseAlert title="Notice" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it.each(['info', 'success', 'warning', 'error'] as const)(
    'renders %s variant without error',
    (variant) => {
      render(<BaseAlert variant={variant} title={variant} />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    },
  )

  it('shows dismiss button when dismissible', () => {
    render(<BaseAlert title="Notice" dismissible />)
    expect(screen.getByRole('button', { name: 'Dismiss alert' })).toBeInTheDocument()
  })

  it('hides after dismiss button click', async () => {
    render(<BaseAlert title="Notice" dismissible />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss alert' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('calls onDismiss callback', async () => {
    const onDismiss = vi.fn()
    render(<BaseAlert title="Notice" dismissible onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss alert' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not show dismiss button when not dismissible', () => {
    render(<BaseAlert title="Notice" />)
    expect(screen.queryByRole('button', { name: 'Dismiss alert' })).not.toBeInTheDocument()
  })
})
