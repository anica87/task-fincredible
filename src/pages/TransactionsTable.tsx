import type React from "react";
import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import type { Transaction } from "@/types/domain.types";

export interface TransactionsTableProps {
  transactions: Transaction[];
}

function formatAmount(transaction: Transaction): string {
  const sign = transaction.type === "DEBIT" ? "-" : "+";
  const magnitude = Math.abs(transaction.amount).toFixed(2);
  return `${sign}${magnitude} ${transaction.currency}`;
}

/** DoD: Raw Transaction History shows ONLY the transactions data, in a structured table. */
export function TransactionsTable({ transactions }: TransactionsTableProps): React.ReactElement {
  const columns = useMemo<DataTableColumn<Transaction>[]>(
    () => [
      { key: "date", header: "Date", accessor: (t) => t.date, width: "14%" },
      { key: "description", header: "Description", accessor: (t) => t.description },
      {
        key: "amount",
        header: "Amount",
        accessor: (t) => formatAmount(t),
        align: "right",
        getCellClassName: (t) =>
          t.type === "DEBIT"
            ? "transactions-table__amount--debit"
            : "transactions-table__amount--credit",
      },
      { key: "type", header: "Type", accessor: (t) => t.type, align: "center", width: "10%" },
    ],
    [],
  );

  return (
    <DataTable<Transaction>
      columns={columns}
      rows={transactions}
      rowKey={(t) => t.id}
      caption="Raw transaction history"
      emptyMessage="No transactions to display."
    />
  );
}
