import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LoadStatus } from "@/types/domain.types";
import { ReloadButton } from "./ReloadButton";

describe("ReloadButton", () => {
  it('shows "Load account data" when idle', () => {
    render(<ReloadButton status="idle" onReload={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Load account data" })).toBeInTheDocument();
  });

  it.each<LoadStatus>(["success", "error"])('shows "Reload" when status is %s', (status) => {
    render(<ReloadButton status={status} onReload={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("shows the loading state and disables the button while loading", () => {
    render(<ReloadButton status="loading" onReload={vi.fn()} />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Loading account…");
    expect(button).toBeDisabled();
  });

  it("calls onReload when clicked", async () => {
    const onReload = vi.fn();
    const user = userEvent.setup();
    render(<ReloadButton status="idle" onReload={onReload} />);

    await user.click(screen.getByRole("button"));

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("does not call onReload when clicked while loading", async () => {
    const onReload = vi.fn();
    const user = userEvent.setup();
    render(<ReloadButton status="loading" onReload={onReload} />);

    await user.click(screen.getByRole("button"));

    expect(onReload).not.toHaveBeenCalled();
  });
});
