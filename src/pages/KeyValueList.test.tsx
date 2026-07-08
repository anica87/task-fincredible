import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KeyValueList, recordToKeyValueItems } from "./KeyValueList";

describe("KeyValueList", () => {
  it("renders a label/value row for each item", () => {
    render(<KeyValueList items={[{ label: "Name", value: "Jane" }]} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("renders a fallback dash for nullish values", () => {
    render(<KeyValueList items={[{ label: "Employer", value: null }]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows the default empty message when there are no items", () => {
    render(<KeyValueList items={[]} />);
    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });

  it("shows a custom empty message when provided", () => {
    render(<KeyValueList items={[]} emptyMessage="Nothing to show." />);
    expect(screen.getByText("Nothing to show.")).toBeInTheDocument();
  });

  it("applies the aria-label to the list", () => {
    const { container } = render(
      <KeyValueList items={[{ label: "Name", value: "Jane" }]} aria-label="Personal info" />,
    );
    const list = container.querySelector("dl");
    expect(list).toHaveAttribute("aria-label", "Personal info");
  });
});

describe("recordToKeyValueItems", () => {
  it("returns an empty array for null/undefined input", () => {
    expect(recordToKeyValueItems(null)).toEqual([]);
    expect(recordToKeyValueItems(undefined)).toEqual([]);
  });

  it("humanizes camelCase and snake_case/kebab-case keys into labels", () => {
    const items = recordToKeyValueItems({ riskScore: 1, account_type: "a", "credit-limit": 2 });

    expect(items.map((i) => i.label)).toEqual(["Risk Score", "Account type", "Credit limit"]);
  });

  it("formats nullish values as a dash", () => {
    const items = recordToKeyValueItems({ note: null });
    expect(items[0].value).toBe("—");
  });

  it("stringifies object values as JSON", () => {
    const items = recordToKeyValueItems({ meta: { flagged: true } });
    expect(items[0].value).toBe(JSON.stringify({ flagged: true }));
  });

  it("converts primitive values to strings", () => {
    const items = recordToKeyValueItems({ score: 42, active: true });
    expect(items[0].value).toBe("42");
    expect(items[1].value).toBe("true");
  });
});
