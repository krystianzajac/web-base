import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithBrand, createMockAuthService } from '@web-base/base-test-utils'
import SignInPage from '../app/auth/signin/page'

describe('SignInPage', () => {
  it('renders email and password inputs', () => {
    renderWithBrand(<SignInPage />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders Sign In button', () => {
    renderWithBrand(<SignInPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls signIn with email and password on submit', async () => {
    const signIn = vi.fn().mockResolvedValue(undefined)
    renderWithBrand(<SignInPage />, { authState: { signIn } })

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'alice@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)

    await waitFor(() => expect(signIn).toHaveBeenCalledWith('alice@example.com', 'password123'))
  })

  it('shows validation error when email is empty', async () => {
    renderWithBrand(<SignInPage />)
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    await waitFor(() => expect(screen.getByText(/email is required/i)).toBeInTheDocument())
  })

  it('shows error alert when auth context has an error', () => {
    const auth = createMockAuthService({ error: 'Invalid credentials' })
    renderWithBrand(<SignInPage />, { authState: auth })
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders link to sign up page', () => {
    renderWithBrand(<SignInPage />)
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/auth/signup')
  })

  it('renders SSO buttons for Google and GitHub', () => {
    renderWithBrand(<SignInPage />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
  })
})
