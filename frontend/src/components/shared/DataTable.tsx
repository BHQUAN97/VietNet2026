'use client'

import { cn } from '@/lib/utils'

export interface Column<T> {
  /** Header text */
  header: string
  /** Render cell content */
  render: (item: T) => React.ReactNode
  /** Extra class cho <th> */
  headerClassName?: string
  /** Extra class cho <td> */
  className?: string
}

interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[]
  /** Data items */
  data: T[]
  /** Unique key extractor */
  rowKey: (item: T) => string
  /** Extra class hoac function cho <tr> (vd: 'group' cho hover-reveal actions) */
  rowClassName?: string | ((item: T) => string)
}

/**
 * DataTable — reusable admin table.
 * Loai bo ~20 dong boilerplate (wrapper, table, thead, tbody, styling) per page.
 *
 * Usage:
 * <DataTable
 *   columns={[
 *     { header: 'Name', render: (item) => <p>{item.name}</p> },
 *     { header: 'Status', render: (item) => <Badge>{item.status}</Badge>, headerClassName: 'text-center' },
 *   ]}
 *   data={items}
 *   rowKey={(item) => item.id}
 * />
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl bg-surface-container-lowest">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container-low">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn('table-header-cell', col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const cls = typeof rowClassName === 'function'
              ? rowClassName(item)
              : rowClassName
            return (
              <tr
                key={rowKey(item)}
                className={cn(
                  'transition-colors hover:bg-surface-container-low/50',
                  cls,
                )}
              >
                {columns.map((col, i) => (
                  <td
                    key={i}
                    className={cn('px-4 py-3', col.className)}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
