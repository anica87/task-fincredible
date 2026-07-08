import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable, type DataTableColumn } from "./DataTable";

interface Row {
  id: string;
  name: string;
  amount: number;
}

const columns: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", accessor: (row) => row.name },
  {
    key: "amount",
    header: "Amount",
    accessor: (row) => row.amount.toFixed(2),
    align: "right",
    getCellClassName: (row) => (row.amount < 0 ? "negative" : undefined),
  },
];

const rows: Row[] = [
  { id: "1", name: "Alice", amount: 100 },
  { id: "2", name: "Bob", amount: -50 },
];

describe("DataTable", () => {
  it("renders a header row from the column definitions", () => {
    render(<DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />);

    const headerRow = screen.getAllByRole("row")[0];
    expect(within(headerRow).getByText("Name")).toBeInTheDocument();
    expect(within(headerRow).getByText("Amount")).toBeInTheDocument();
  });

  it("renders one row per data item, using the accessor for cell content", () => {
    render(<DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("100.00")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("-50.00")).toBeInTheDocument();
  });

  it("applies getCellClassName per cell", () => {
    render(<DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />);

    expect(screen.getByText("-50.00")).toHaveClass("negative");
    expect(screen.getByText("100.00")).not.toHaveClass("negative");
  });

  it("shows the default empty message when there are no rows", () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(r) => r.id} />);
    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });

  it("shows a custom empty message when provided", () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(r) => r.id}
        emptyMessage="Nothing here yet."
      />,
    );
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
  });

  it("renders a caption when provided and uses it as the accessible name", () => {
    render(<DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption="My table" />);

    expect(screen.getByText("My table")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "My table" })).toBeInTheDocument();
  });

  it("prefers an explicit aria-label over the caption for the accessible name", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        caption="My table"
        aria-label="Custom label"
      />,
    );

    expect(screen.getByRole("table", { name: "Custom label" })).toBeInTheDocument();
  });
});
