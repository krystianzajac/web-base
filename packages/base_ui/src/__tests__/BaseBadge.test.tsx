import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BaseBadge } from '../components/BaseBadge'

describe('BaseBadge', () => {
  it('renders children text', () => {
    render(<BaseBadge>Active</BaseBadge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it.each(['default', 'primary', 'success', 'warning', 'error'] as const)(
    'renders %s variant without error',
    (variant) => {
      render(<BaseBadge variant={variant}>{variant}</BaseBadge>)
      expect(screen.getByText(variant)).toBeInTheDocument()
    },
  )

  it.each(['sm', 'md'] as const)('renders %s size without error', (size) => {
    render(<BaseBadge size={size}>Badge</BaseBadge>)
    expect(screen.getByText('Badge')).toBeInTheDocument()
  })
})
