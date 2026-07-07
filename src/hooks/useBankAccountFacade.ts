// import { useCallback, useState } from "react";
import { useQuery } from '@tanstack/react-query';

import { mapBankData } from "@/api/bankMappers";
import { computeResults } from "@/api/bankResultsService";
import type { BankAccountViewState } from "@/types/domain.types";
import { fetchBankAccountData } from "../api/finCredibleBankClient";

/** Query key for the single bank-account-data fetch flow (token -> bank-data). */
const BANK_ACCOUNT_QUERY_KEY = ['bankAccountData'] as const;

type FacadeData = Omit<BankAccountViewState, 'status' | 'error'>;

const EMPTY_DATA: FacadeData = {
  personalDetails: null,
  accounts: [],
  transactions: [],
  results: [],
};

/**
 * Facade consumed by UI components (tabs, tables, reload button).
 * Components should only talk to this hook — never call the api/services
 * layers directly — so the data-fetching flow (token -> bank-data -> map ->
 * compute results) stays in one place.
 *
 * Usage:
 *   const { status, personalDetails, accounts, transactions, results, error, reload } = useBankAccountFacade();
 *   <button onClick={reload}>Reload</button>
 */
export function useBankAccountFacade() {
  // Diffrence between tanstack and react use state
  // const [state, setState] = useState<BankAccountViewState>(INITIAL_STATE);

  // const reload = useCallback(async () => {
  //   setState((prev) => ({ ...prev, status: "loading", error: null }));

  //   try {
  //     const raw = await fetchBankAccountData();
  //     const { personalDetails, accounts, transactions } = mapBankData(raw);
  //     const results = computeResults(personalDetails, accounts, transactions);

  //     setState({
  //       status: "success",
  //       personalDetails,
  //       accounts,
  //       transactions,
  //       results,
  //       error: null,
  //     });
  //   } catch (err) {
  //     setState({
  //       status: "error",
  //       personalDetails: null,
  //       accounts: [],
  //       transactions: [],
  //       results: [],
  //       error: err instanceof Error ? err.message : "Failed to load bank account data.",
  //     });
  //   }
  // }, []);

  // return { ...state, reload };

  const query = useQuery({
    queryKey: BANK_ACCOUNT_QUERY_KEY,
    queryFn: fetchBankAccountData,
    enabled: false, // no fetch on mount, reload btn
    //React Query caches the selected value, so this only re-runs when the raw query data actually changes 
    select: (raw): FacadeData => {
      const { personalDetails, accounts, transactions } = mapBankData(raw);
      const results = computeResults(personalDetails, accounts, transactions);
      return { personalDetails, accounts, transactions, results };
    },
  });

  const status: BankAccountViewState['status'] = query.isFetching
    ? 'loading'
    : query.isError
      ? 'error'
      : query.isSuccess
        ? 'success'
        : 'idle';

  const error = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : 'Failed to load bank account data.'
    : null;

  return {
    status,
    error,
    ...(query.data ?? EMPTY_DATA),
    reload: query.refetch,
  };
}
