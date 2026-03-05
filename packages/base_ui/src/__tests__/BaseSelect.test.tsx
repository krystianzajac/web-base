import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BaseSelect } from '../components/BaseSelect'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

describe('BaseSelect', () => {
  it('renders with label', () => {
    render(<BaseSelect label="Fruit" options={options} />)
    expect(screen.getByText('Fruit')).toBeInTheDocument()
  })

  it('renders placeholder text', () => {
    render(<BaseSelect options={options} placeholder="Pick a fruit" />)
    expect(screen.getByText('Pick a fruit')).toBeInTheDocument()
  })

  it('shows selected value', () => {
    render(<BaseSelect options={options} value="banana" />)
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<BaseSelect options={options} error="Please select an option" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Please select an option')
  })

  it('is disabled when disabled prop is true', () => {
    render(<BaseSelect options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('has accessible combobox role', () => {
    render(<BaseSelect options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
