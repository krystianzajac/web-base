import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithBrand, createMockAuthService } from '@web-base/base-test-utils'
import SignUpPage from '../app/auth/signup/page'

describe('SignUpPage', () => {
  it('renders display name, email and password inputs', () => {
    renderWithBrand(<SignUpPage />)
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders Create Account button', () => {
    renderWithBrand(<SignUpPage />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('calls signUp with email, password and displayName on submit', async () => {
    const signUp = vi.fn().mockResolvedValue(undefined)
    renderWithBrand(<SignUpPage />, { authState: { signUp } })

    fireEvent.change(screen.getByLabelText(/display name/i), {
      target: { value: 'Alice' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'alice@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.submit(
      screen.getByRole('button', { name: /create account/i }).closest('form')!,
    )

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith('alice@example.com', 'password123', 'Alice'),
    )
  })

  it('shows password validation error for short password', async () => {
    renderWithBrand(<SignUpPage />)

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'alice@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'short' },
    })
    fireEvent.submit(
      screen.getByRole('button', { name: /create account/i }).closest('form')!,
    )

    await waitFor(() =>
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument(),
    )
  })

  it('shows error alert when auth context has an error', () => {
    const auth = createMockAuthService({ error: 'Email already in use' })
    renderWithBrand(<SignUpPage />, { authState: auth })
    expect(screen.getByText('Email already in use')).toBeInTheDocument()
  })

  it('renders link to sign in page', () => {
    renderWithBrand(<SignUpPage />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/auth/signin')
  })
})
