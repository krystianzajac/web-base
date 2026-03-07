import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BaseTable } from '../components/BaseTable'

interface TestRow {
  id: string
  name: string
  status: string
  [key: string]: unknown
}

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status' },
]

const data: TestRow[] = [
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob', status: 'inactive' },
]

describe('BaseTable', () => {
  it('renders headers and rows', () => {
    render(<BaseTable columns={columns} data={data} />)
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('calls onSort when sortable header clicked', async () => {
    const onSort = vi.fn()
    render(<BaseTable columns={columns} data={data} onSort={onSort} />)
    await userEvent.click(screen.getByText('Name'))
    expect(onSort).toHaveBeenCalledWith('name')
  })

  it('does not call onSort for non-sortable columns', async () => {
    const onSort = vi.fn()
    render(<BaseTable columns={columns} data={data} onSort={onSort} />)
    await userEvent.click(screen.getByText('ID'))
    expect(onSort).not.toHaveBeenCalled()
  })

  it('shows empty message when no data', () => {
    render(<BaseTable columns={columns} data={[]} emptyMessage="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('calls onRowClick when row clicked', async () => {
    const onRowClick = vi.fn()
    render(<BaseTable columns={columns} data={data} onRowClick={onRowClick} />)
    await userEvent.click(screen.getByText('Alice'))
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('renders custom cell via render prop', () => {
    const customColumns = [
      ...columns.slice(0, 2),
      {
        key: 'status',
        header: 'Status',
        render: (value: unknown) => <span data-testid="custom">{String(value)}</span>,
      },
    ]
    render(<BaseTable columns={customColumns} data={data} />)
    expect(screen.getAllByTestId('custom')).toHaveLength(2)
  })

  it('shows sort indicator when sorted', () => {
    render(
      <BaseTable
        columns={columns}
        data={data}
        sortKey="name"
        sortDirection="asc"
      />,
    )
    expect(screen.getByText('Name').closest('th')).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
  })
})
