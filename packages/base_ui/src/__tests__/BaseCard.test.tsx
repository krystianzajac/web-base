import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BaseCard } from '../components/BaseCard'

describe('BaseCard', () => {
  it('renders children', () => {
    render(<BaseCard>Card content</BaseCard>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<BaseCard className="my-custom-class">Content</BaseCard>)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it.each(['sm', 'md', 'lg'] as const)('renders with %s padding without error', (padding) => {
    const { container } = render(<BaseCard padding={padding}>Content</BaseCard>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it.each(['none', 'subtle', 'medium', 'strong'] as const)('renders with %s shadow without error', (shadow) => {
    const { container } = render(<BaseCard shadow={shadow}>Content</BaseCard>)
    expect(container.firstChild).toBeInTheDocument()
  })
})
