import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithBrand } from '../render/render-with-brand'
import { useBrand } from '@web-base/base-ui'
import { useAuth } from '@web-base/base-auth'
import { TestData } from '../data/test-data'

function BrandConsumer() {
  const { brand } = useBrand()
  return <div data-testid="brand-name">{brand.name}</div>
}

function AuthConsumer() {
  const { user, loading } = useAuth()
  return (
    <div>
      <div data-testid="auth-loading">{String(loading)}</div>
      <div data-testid="auth-user">{user?.displayName ?? 'none'}</div>
    </div>
  )
}

describe('renderWithBrand', () => {
  it('BrandProvider is in the tree — useBrand returns the configured brand', () => {
    renderWithBrand(<BrandConsumer />)
    expect(screen.getByTestId('brand-name')).toHaveTextContent('Plain Test App')
  })

  it('AuthContext is in the tree — useAuth returns mock auth state', () => {
    renderWithBrand(<AuthConsumer />)
    expect(screen.getByTestId('auth-loading')).toHaveTextContent('false')
    expect(screen.getByTestId('auth-user')).toHaveTextContent('none')
  })

  it('injects pre-authenticated user via authState', () => {
    const user = TestData.user({ displayName: 'Alice' })
    renderWithBrand(<AuthConsumer />, { authState: { user } })
    expect(screen.getByTestId('auth-user')).toHaveTextContent('Alice')
  })

  it('applies custom brand from options', () => {
    renderWithBrand(<BrandConsumer />, {
      brand: { name: 'Custom Brand', primaryColor: '#000', secondaryColor: '#fff',
               errorColor: '#f00', successColor: '#0f0', warningColor: '#ff0',
               fonts: { heading: 'Inter', body: 'Inter', mono: 'mono' },
               logo: '/logo.svg', spacing: 'compact', radius: 'sharp' },
    })
    expect(screen.getByTestId('brand-name')).toHaveTextContent('Custom Brand')
  })
})
