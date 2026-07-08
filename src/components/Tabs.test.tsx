import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { type TabDefinition, Tabs } from "./Tabs";

type TabKey = "first" | "second" | "third";

const tabs: TabDefinition<TabKey>[] = [
  { key: "first", label: "First", content: <p>First content</p> },
  { key: "second", label: "Second", content: <p>Second content</p> },
  { key: "third", label: "Third", content: <p>Third content</p>, disabled: true },
];

describe("Tabs", () => {
  it("renders a tab button for each tab definition", () => {
    render(<Tabs tabs={tabs} activeTab="first" onChange={vi.fn()} />);

    expect(screen.getByRole("tab", { name: "First" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Second" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Third" })).toBeInTheDocument();
  });

  it("renders only the active tab's panel content", () => {
    render(<Tabs tabs={tabs} activeTab="first" onChange={vi.fn()} />);

    expect(screen.getByText("First content")).toBeInTheDocument();
    expect(screen.queryByText("Second content")).not.toBeInTheDocument();
    expect(screen.queryByText("Third content")).not.toBeInTheDocument();
  });

  it("marks the active tab with aria-selected", () => {
    render(<Tabs tabs={tabs} activeTab="second" onChange={vi.fn()} />);

    expect(screen.getByRole("tab", { name: "Second" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "First" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange with the clicked tab's key", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} activeTab="first" onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Second" }));

    expect(onChange).toHaveBeenCalledWith("second");
  });

  it("does not call onChange for a disabled tab", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} activeTab="first" onChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Third" }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables the button for a disabled tab", () => {
    render(<Tabs tabs={tabs} activeTab="first" onChange={vi.fn()} />);
    expect(screen.getByRole("tab", { name: "Third" })).toBeDisabled();
  });

  it("links each tab button to its panel via aria-controls / id", () => {
    render(<Tabs tabs={tabs} activeTab="first" onChange={vi.fn()} />);

    const tabButton = screen.getByRole("tab", { name: "First" });
    const panel = screen.getByRole("tabpanel");

    expect(tabButton).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tabButton.id);
  });
});
