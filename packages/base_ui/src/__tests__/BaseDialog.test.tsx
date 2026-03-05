import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BaseDialog } from '../components/BaseDialog'

describe('BaseDialog', () => {
  it('renders title when open', () => {
    render(<BaseDialog open onClose={() => {}} title="Confirm Action" />)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <BaseDialog
        open
        onClose={() => {}}
        title="Title"
        description="Are you sure?"
      />,
    )
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <BaseDialog open onClose={() => {}} title="Title">
        <p>Dialog body text</p>
      </BaseDialog>,
    )
    expect(screen.getByText('Dialog body text')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<BaseDialog open={false} onClose={() => {}} title="Hidden Dialog" />)
    expect(screen.queryByText('Hidden Dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<BaseDialog open onClose={onClose} title="Dialog" />)
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has accessible dialog role', () => {
    render(<BaseDialog open onClose={() => {}} title="Accessible Dialog" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
