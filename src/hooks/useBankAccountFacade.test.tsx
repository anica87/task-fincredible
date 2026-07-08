import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchBankAccountData } from "@/api/finCredibleBankClient";
import { useBankAccountFacade } from "./useBankAccountFacade";

vi.mock("@/api/finCredibleBankClient", () => ({
  fetchBankAccountData: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchBankAccountData);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const rawBankData = {
  Name: "Jane",
  LastName: "Doe",
  DOB: "1980.10.29",
  IBAN: "AT611904300234573201",
  Country: "AT",
  City: "Vienna",
  Address: "Main St 1",
  PostalCode: "1010",
  EmploymentStatus: "Employed",
  Employer: "Acme Corp",
  Accounts: [
    {
      Session: "session-1",
      AccountCurrency: "EUR",
      CurrentBalance: "-100",
      PreviousMonthBalance: "500",
      Transactions: [
        { Date: "2024-01-05", Type: "deposit", Description: "Salary payment", Amount: 2000 },
      ],
    },
  ],
};

describe("useBankAccountFacade", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it("starts idle and does not fetch on mount", () => {
    mockedFetch.mockResolvedValue(rawBankData);
    const { result } = renderHook(() => useBankAccountFacade(), { wrapper: createWrapper() });

    expect(result.current.status).toBe("idle");
    expect(result.current.personalDetails).toBeNull();
    expect(result.current.accounts).toEqual([]);
    expect(result.current.transactions).toEqual([]);
    expect(result.current.results).toEqual([]);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("reports status 'loading' while the fetch is in flight", async () => {
    let resolveFetch: (value: typeof rawBankData) => void = () => {};
    mockedFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    const { result } = renderHook(() => useBankAccountFacade(), { wrapper: createWrapper() });

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.status).toBe("loading"));

    act(() => {
      resolveFetch(rawBankData);
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
  });

  it("fetches, maps, and computes results when reload is called", async () => {
    mockedFetch.mockResolvedValue(rawBankData);
    const { result } = renderHook(() => useBankAccountFacade(), { wrapper: createWrapper() });

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(result.current.personalDetails).toMatchObject({ firstName: "Jane", lastName: "Doe" });
    expect(result.current.accounts).toEqual([
      { session: "session-1", currency: "EUR", currentBalance: -100, previousMonthBalance: 500 },
    ]);
    expect(result.current.transactions).toHaveLength(1);
    // Negative balance -> DEBT_RISK HIGH, computed via the real bankResultsService.
    expect(result.current.results).toContainEqual({ code: "DEBT_RISK", result: "HIGH" });
    expect(result.current.error).toBeNull();
  });

  it("surfaces an error status and message when the fetch fails", async () => {
    mockedFetch.mockRejectedValue(new Error("Fetching session token failed: 500 Server Error"));
    const { result } = renderHook(() => useBankAccountFacade(), { wrapper: createWrapper() });

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.status).toBe("error"));

    expect(result.current.error).toBe("Fetching session token failed: 500 Server Error");
    expect(result.current.personalDetails).toBeNull();
    expect(result.current.accounts).toEqual([]);
  });

  it("re-fetches on a second reload call", async () => {
    mockedFetch.mockResolvedValue(rawBankData);
    const { result } = renderHook(() => useBankAccountFacade(), { wrapper: createWrapper() });

    act(() => {
      result.current.reload();
    });
    await waitFor(() => expect(result.current.status).toBe("success"));

    act(() => {
      result.current.reload();
    });
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
  });
});
