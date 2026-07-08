import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultCode, type ResultItem } from "@/types/domain.types";
import { ResultsTable } from "./ResultsTable";

describe("ResultsTable", () => {
  it("renders one row per result with its code and result value", () => {
    const results: ResultItem[] = [
      { code: ResultCode.IBAN_CHECK, result: "verified" },
      { code: ResultCode.DEBT_RISK, result: "HIGH" },
    ];
    render(<ResultsTable results={results} />);

    expect(screen.getByText("IBAN_CHECK")).toBeInTheDocument();
    expect(screen.getByText("verified")).toBeInTheDocument();
    expect(screen.getByText("DEBT_RISK")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  // DoD: verified/LOW -> green, unverified -> yellow, HIGH -> red.
  it.each([
    ["verified", "results-table__cell--green"],
    ["LOW", "results-table__cell--green"],
    ["unverified", "results-table__cell--yellow"],
    ["HIGH", "results-table__cell--red"],
  ] as const)("colors a %s result as %s", (result, expectedClass) => {
    render(<ResultsTable results={[{ code: ResultCode.IBAN_CHECK, result }]} />);
    expect(screen.getByText(result)).toHaveClass(expectedClass);
  });

  it("shows the empty message when there are no results", () => {
    render(<ResultsTable results={[]} />);
    expect(screen.getByText("No results to display.")).toBeInTheDocument();
  });
});
