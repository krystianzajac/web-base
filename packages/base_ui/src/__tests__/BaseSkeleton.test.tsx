import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BaseSkeleton } from '../components/BaseSkeleton'

describe('BaseSkeleton', () => {
  it('renders with accessible status role', () => {
    render(<BaseSkeleton />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('applies width and height styles', () => {
    render(<BaseSkeleton width={200} height={40} />)
    const el = screen.getByRole('status')
    expect(el).toHaveStyle({ width: '200px', height: '40px' })
  })

  it('accepts string dimensions', () => {
    render(<BaseSkeleton width="100%" height="2rem" />)
    const el = screen.getByRole('status')
    expect(el).toHaveStyle({ width: '100%', height: '2rem' })
  })

  it.each(['text', 'circular', 'rectangular'] as const)(
    'renders %s variant without error',
    (variant) => {
      render(<BaseSkeleton variant={variant} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    },
  )
})
