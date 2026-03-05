import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BaseSpinner } from '../components/BaseSpinner'

describe('BaseSpinner', () => {
  it('renders with accessible label', () => {
    render(<BaseSpinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg'] as const)('renders %s size without error', (size) => {
    render(<BaseSpinner size={size} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
