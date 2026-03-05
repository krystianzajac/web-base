import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BaseInput } from '../components/BaseInput'

describe('BaseInput', () => {
  it('renders with label', () => {
    render(<BaseInput label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders placeholder text', () => {
    render(<BaseInput placeholder="Enter email" />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('shows error message and sets aria-invalid', () => {
    render(<BaseInput label="Email" error="Invalid email" />)
    const input = screen.getByLabelText('Email')
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows helper text when no error', () => {
    render(<BaseInput label="Email" helperText="We won't share your email" />)
    expect(screen.getByText("We won't share your email")).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<BaseInput label="Email" disabled />)
    expect(screen.getByLabelText('Email')).toBeDisabled()
  })

  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<BaseInput label="Name" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Name'), 'Alice')
    expect(onChange).toHaveBeenCalled()
  })

  it('has accessible label via aria-describedby for helper text', () => {
    render(<BaseInput label="Bio" helperText="Tell us about yourself" />)
    const input = screen.getByLabelText('Bio')
    const helperId = input.getAttribute('aria-describedby')
    expect(helperId).toBeTruthy()
    expect(document.getElementById(helperId!)).toHaveTextContent('Tell us about yourself')
  })
})
