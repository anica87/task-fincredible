import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and defaults to the primary variant", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toHaveClass("btn", "btn--primary");
  });

  it("applies the requested variant class", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn--ghost");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  describe("isLoading", () => {
    it("shows the default loading text and marks the button busy + disabled", () => {
      render(<Button isLoading>Save</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Loading…");
      expect(button).not.toHaveTextContent("Save");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("shows custom loadingText when provided", () => {
      render(
        <Button isLoading loadingText="Saving…">
          Save
        </Button>,
      );
      expect(screen.getByRole("button")).toHaveTextContent("Saving…");
    });

    it("is disabled even without an explicit disabled prop", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Button isLoading onClick={onClick}>
          Save
        </Button>,
      );

      await user.click(screen.getByRole("button"));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  it("merges a custom className with the variant classes", () => {
    render(<Button className="extra-class">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn", "btn--primary", "extra-class");
  });
});
