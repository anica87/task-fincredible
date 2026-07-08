import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBankAccountFacade } from "@/hooks/useBankAccountFacade";
import { ResultCode } from "@/types/domain.types";
import { BankAccountView } from "./BankAccountView";

vi.mock("@/hooks/useBankAccountFacade");

const mockedUseFacade = vi.mocked(useBankAccountFacade);

function facadeState(overrides: Partial<ReturnType<typeof useBankAccountFacade>> = {}) {
  return {
    status: "idle" as const,
    personalDetails: null,
    accounts: [],
    transactions: [],
    results: [],
    error: null,
    reload: vi.fn(),
    ...overrides,
  };
}

describe("BankAccountView", () => {
  beforeEach(() => {
    mockedUseFacade.mockReset();
  });

  it('prompts the user to load data when idle, per the "no data until loaded" DoD', () => {
    mockedUseFacade.mockReturnValue(facadeState({ status: "idle" }));
    render(<BankAccountView />);

    expect(screen.getByText('Click "Load account data" to get started.')).toBeInTheDocument();
  });

  it("shows a loading message while loading", () => {
    mockedUseFacade.mockReturnValue(facadeState({ status: "loading" }));
    render(<BankAccountView />);

    expect(screen.getByText("Loading account data…")).toBeInTheDocument();
  });

  it("shows the error message and does not render personal details when the load failed", () => {
    mockedUseFacade.mockReturnValue(
      facadeState({ status: "error", error: "Fetching bank data failed: 500 Server Error" }),
    );
    render(<BankAccountView />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Fetching bank data failed: 500 Server Error",
    );
    expect(screen.getByText("No data available due to the error above.")).toBeInTheDocument();
  });

  it("renders personal details on success", () => {
    mockedUseFacade.mockReturnValue(
      facadeState({
        status: "success",
        personalDetails: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "1980-10-29",
          iban: "AT611904300234573201",
          country: "AT",
          city: "Vienna",
          address: "Main St 1",
          postalCode: "1010",
          employmentStatus: "Employed",
          employer: "Acme Corp",
        },
      }),
    );
    render(<BankAccountView />);

    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("switches tab content when a tab is clicked", async () => {
    const user = userEvent.setup();
    mockedUseFacade.mockReturnValue(
      facadeState({
        status: "success",
        personalDetails: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: "1980-10-29",
          iban: "AT611904300234573201",
          country: "AT",
          city: "Vienna",
          address: "Main St 1",
          postalCode: "1010",
          employmentStatus: "Employed",
          employer: "Acme Corp",
        },
        results: [{ code: ResultCode.IBAN_CHECK, result: "verified" }],
      }),
    );
    render(<BankAccountView />);

    expect(screen.getByText("Jane")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Results" }));

    expect(screen.queryByText("Jane")).not.toBeInTheDocument();
    expect(screen.getByText("IBAN_CHECK")).toBeInTheDocument();
  });

  it("calls reload when the reload button is clicked", async () => {
    const reload = vi.fn();
    const user = userEvent.setup();
    mockedUseFacade.mockReturnValue(facadeState({ status: "idle", reload }));
    render(<BankAccountView />);

    await user.click(screen.getByRole("button", { name: "Load account data" }));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
