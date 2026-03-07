import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BaseTabs, BaseTabPanel } from '../components/BaseTabs'

const tabs = [
  { value: 'one', label: 'Tab One' },
  { value: 'two', label: 'Tab Two' },
  { value: 'three', label: 'Tab Three', disabled: true },
]

describe('BaseTabs', () => {
  it('renders all tab triggers', () => {
    render(
      <BaseTabs tabs={tabs}>
        <BaseTabPanel value="one">Content one</BaseTabPanel>
        <BaseTabPanel value="two">Content two</BaseTabPanel>
        <BaseTabPanel value="three">Content three</BaseTabPanel>
      </BaseTabs>,
    )
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toBeInTheDocument()
  })

  it('shows first tab panel by default', () => {
    render(
      <BaseTabs tabs={tabs}>
        <BaseTabPanel value="one">Content one</BaseTabPanel>
        <BaseTabPanel value="two">Content two</BaseTabPanel>
      </BaseTabs>,
    )
    expect(screen.getByText('Content one')).toBeInTheDocument()
  })

  it('switches tabs on click', async () => {
    const onValueChange = vi.fn()
    render(
      <BaseTabs tabs={tabs} onValueChange={onValueChange}>
        <BaseTabPanel value="one">Content one</BaseTabPanel>
        <BaseTabPanel value="two">Content two</BaseTabPanel>
      </BaseTabs>,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Tab Two' }))
    expect(onValueChange).toHaveBeenCalledWith('two')
  })

  it('respects disabled tabs', () => {
    render(
      <BaseTabs tabs={tabs}>
        <BaseTabPanel value="one">Content one</BaseTabPanel>
        <BaseTabPanel value="three">Content three</BaseTabPanel>
      </BaseTabs>,
    )
    expect(screen.getByRole('tab', { name: 'Tab Three' })).toBeDisabled()
  })

  it('renders with controlled value', () => {
    render(
      <BaseTabs tabs={tabs} value="two">
        <BaseTabPanel value="one">Content one</BaseTabPanel>
        <BaseTabPanel value="two">Content two</BaseTabPanel>
      </BaseTabs>,
    )
    expect(screen.getByText('Content two')).toBeInTheDocument()
  })
})
