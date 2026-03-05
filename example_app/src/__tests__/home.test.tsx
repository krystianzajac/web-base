import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithBrand } from '@web-base/base-test-utils'
import HomePage from '../app/page'

// CmsText uses useCms which needs CmsProvider — renderWithBrand provides it.
// With no Supabase connection in tests, the fallback text is shown.
vi.mock('@web-base/base-cms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@web-base/base-cms')>()
  return actual
})

describe('HomePage', () => {
  it('renders the CmsText welcome headline (fallback while no Supabase)', () => {
    renderWithBrand(<HomePage />)
    expect(screen.getByText('Welcome to Example App')).toBeInTheDocument()
  })

  it('renders the CmsText tagline fallback', () => {
    renderWithBrand(<HomePage />)
    expect(screen.getByText('A demonstration of all web-base packages.')).toBeInTheDocument()
  })

  it('shows Sign In and Sign Up links', () => {
    renderWithBrand(<HomePage />)
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signInLink).toHaveAttribute('href', '/auth/signin')
    expect(signUpLink).toHaveAttribute('href', '/auth/signup')
  })

  it('renders all BaseButton variants', () => {
    renderWithBrand(<HomePage />)
    expect(screen.getByRole('button', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /secondary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tertiary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /destructive/i })).toBeInTheDocument()
  })
})
