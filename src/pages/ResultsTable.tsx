import { DataTable, DataTableColumn } from '@/components/DataTable';
import { getResultColor, ResultItem } from '@/types/domain.types';
import React, { useMemo } from 'react';


export interface ResultsTableProps {
  results: ResultItem[];
}

const RESULT_COLOR_CLASS_NAME: Record<ReturnType<typeof getResultColor>, string> = {
  green: 'results-table__cell--green',
  yellow: 'results-table__cell--yellow',
  red: 'results-table__cell--red',
};

/**
 * DoD: 2-column table (code, result) with background colors:
 * verified/LOW -> green, unverified -> yellow, HIGH -> red.
 */
export function ResultsTable({ results }: ResultsTableProps): React.ReactElement {
  const columns = useMemo<DataTableColumn<ResultItem>[]>(
    () => [
      { key: 'code', header: 'Code', accessor: (item) => item.code },
      {
        key: 'result',
        header: 'Result',
        accessor: (item) => item.result,
        getCellClassName: (item) => RESULT_COLOR_CLASS_NAME[getResultColor(item)],
      },
    ],
    [],
  );

  return (
    <DataTable<ResultItem>
      columns={columns}
      rows={results}
      rowKey={(item) => item.code}
      caption="Results"
      emptyMessage="No results to display."
    />
  );
}
