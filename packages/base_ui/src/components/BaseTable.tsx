import React from 'react'
import { cn } from '../lib/cn'

export interface BaseTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
}

export interface BaseTableProps<T extends Record<string, unknown>> {
  columns: BaseTableColumn<T>[]
  data: T[]
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
  stickyHeader?: boolean
}

/** Data table with sorting, striped rows, and empty state. */
export function BaseTable<T extends Record<string, unknown>>({
  columns,
  data,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  emptyMessage = 'No data',
  className,
  stickyHeader,
}: BaseTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-body-medium">
        <thead>
          <tr className="border-b border-[var(--color-divider)]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                aria-sort={
                  sortKey === col.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                className={cn(
                  'px-4 py-3 text-left text-label-medium font-medium',
                  'text-[var(--color-text-secondary)]',
                  'bg-[var(--color-surface)]',
                  stickyHeader && 'sticky top-0 z-10',
                  col.sortable && 'cursor-pointer select-none',
                  col.className,
                )}
                onClick={
                  col.sortable && onSort
                    ? () => onSort(col.key)
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span aria-hidden="true">
                      {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-body-medium text-[var(--color-text-disabled)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
                className={cn(
                  'border-b border-[var(--color-divider)]',
                  'transition-colors duration-fast',
                  rowIndex % 2 === 1 && 'bg-[var(--color-surface)]',
                  onRowClick &&
                    'cursor-pointer hover:bg-[var(--color-divider)]',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-[var(--color-text-primary)]',
                      col.className,
                    )}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
