import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BaseTimeline } from '../components/BaseTimeline'

const items = [
  { id: '1', title: 'Created', description: 'Account was created', timestamp: '2024-01-01' },
  { id: '2', title: 'Updated', description: 'Profile updated', variant: 'success' as const },
  { id: '3', title: 'Deleted', variant: 'error' as const },
]

describe('BaseTimeline', () => {
  it('renders all items', () => {
    render(<BaseTimeline items={items} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows titles and descriptions', () => {
    render(<BaseTimeline items={items} />)
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Account was created')).toBeInTheDocument()
    expect(screen.getByText('Updated')).toBeInTheDocument()
    expect(screen.getByText('Deleted')).toBeInTheDocument()
  })

  it('shows timestamps', () => {
    render(<BaseTimeline items={items} />)
    expect(screen.getByText('2024-01-01')).toBeInTheDocument()
  })

  it('renders custom icons', () => {
    const itemsWithIcon = [
      { id: '1', title: 'Custom', icon: <span data-testid="custom-icon">X</span> },
    ]
    render(<BaseTimeline items={itemsWithIcon} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('has list role for accessibility', () => {
    render(<BaseTimeline items={items} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})
