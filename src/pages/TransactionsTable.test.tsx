import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Transaction } from "@/types/domain.types";
import { TransactionsTable } from "./TransactionsTable";

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "t1",
    date: "2024-01-05",
    description: "Salary payment",
    amount: 2000,
    currency: "EUR",
    type: "CREDIT",
    accountSession: "session-1",
    ...overrides,
  };
}

describe("TransactionsTable", () => {
  it("renders date, description, amount, and type for each transaction", () => {
    render(<TransactionsTable transactions={[makeTransaction()]} />);

    expect(screen.getByText("2024-01-05")).toBeInTheDocument();
    expect(screen.getByText("Salary payment")).toBeInTheDocument();
    expect(screen.getByText("+2000.00 EUR")).toBeInTheDocument();
    expect(screen.getByText("CREDIT")).toBeInTheDocument();
  });

  it("formats a debit amount with a minus sign and the absolute magnitude", () => {
    render(
      <TransactionsTable
        transactions={[makeTransaction({ amount: -900, type: "DEBIT", description: "Rent" })]}
      />,
    );

    expect(screen.getByText("-900.00 EUR")).toBeInTheDocument();
  });

  it("applies distinct classes to debit vs credit amount cells", () => {
    render(
      <TransactionsTable
        transactions={[
          makeTransaction({ id: "credit", amount: 100, type: "CREDIT" }),
          makeTransaction({ id: "debit", amount: -100, type: "DEBIT", description: "Rent" }),
        ]}
      />,
    );

    expect(screen.getByText("+100.00 EUR")).toHaveClass("transactions-table__amount--credit");
    expect(screen.getByText("-100.00 EUR")).toHaveClass("transactions-table__amount--debit");
  });

  it("shows the empty message when there are no transactions", () => {
    render(<TransactionsTable transactions={[]} />);
    expect(screen.getByText("No transactions to display.")).toBeInTheDocument();
  });
});
