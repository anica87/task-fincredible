import React, { ReactNode } from 'react';

/**
 * Column definition for DataTable<T>.
 * `accessor` renders the cell content; `getCellClassName` lets callers
 * apply per-cell styling (e.g. the verified/unverified/HIGH/LOW colors)
 * without DataTable knowing anything about bank-specific concepts.
 */
export interface DataTableColumn<T> {
  /** Unique key for the column (used as React key + optional data attribute). */
  key: string;
  header: ReactNode;
  accessor: (row: T, rowIndex: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  getCellClassName?: (row: T, rowIndex: number) => string | undefined;
  getHeaderClassName?: () => string | undefined;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Stable unique key for each row, e.g. (row) => row.id */
  rowKey: (row: T, rowIndex: number) => string;
  caption?: string;
  emptyMessage?: ReactNode;
  getRowClassName?: (row: T, rowIndex: number) => string | undefined;
  className?: string;
  'aria-label'?: string;
}

/**
 * Generic, presentation-only table. Knows nothing about bank domain
 * concepts — it renders whatever `columns` tell it to, for any row type T.
 * Reused by TransactionsTable<Transaction> and ResultsTable<ResultItem>.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  emptyMessage = 'No data available.',
  getRowClassName,
  className,
  'aria-label': ariaLabel,
}: DataTableProps<T>): React.ReactElement {
  return (
    <div className={['data-table-wrapper', className].filter(Boolean).join(' ')}>
      <table className="data-table" aria-label={ariaLabel ?? caption}>
        {caption ? <caption className="data-table__caption">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{ width: column.width, textAlign: column.align ?? 'left' }}
                className={column.getHeaderClassName?.()}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowKey(row, rowIndex)} className={getRowClassName?.(row, rowIndex)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{ textAlign: column.align ?? 'left' }}
                    className={column.getCellClassName?.(row, rowIndex)}
                  >
                    {column.accessor(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
