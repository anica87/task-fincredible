import React, { ReactNode } from 'react';

export interface KeyValueItem {
  label: string;
  value: ReactNode;
}

export interface KeyValueListProps {
  items: KeyValueItem[];
  emptyMessage?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

/** Generic label/value grid — used for Personal Details, reusable for any record-like data. */
export function KeyValueList({
  items,
  emptyMessage = 'No data available.',
  className,
  'aria-label': ariaLabel,
}: KeyValueListProps): React.ReactElement {
  if (items.length === 0) {
    return <p className="key-value-list__empty">{emptyMessage}</p>;
  }

  return (
    <dl className={['key-value-list', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      {items.map((item) => (
        <div className="key-value-list__row" key={item.label}>
          <dt className="key-value-list__label">{item.label}</dt>
          <dd className="key-value-list__value">{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Utility: flattens an unknown record (e.g. PersonalDetails.extra) into
 * KeyValueItem[] with human-readable labels, so any extra API fields can
 * still be rendered generically.
 */
export function recordToKeyValueItems(
  record: Record<string, unknown> | undefined | null,
): KeyValueItem[] {
  if (!record) return [];
  return Object.entries(record).map(([key, value]) => ({
    label: humanizeKey(key),
    value: formatUnknownValue(value),
  }));
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
}

function formatUnknownValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
