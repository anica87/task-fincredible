import { useCallback, useState } from 'react';
import { fetchBankAccountData } from '../api/finCredibleBankClient';

import { BankAccountViewState } from '@/types/domain.types';
import { computeResults } from '@/api/bankResultsService';
import { mapBankData } from '@/api/bankMappers';

const INITIAL_STATE: BankAccountViewState = {
  status: 'idle',
  personalDetails: null,
  accounts: [],
  transactions: [],
  results: [],
  error: null,
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
  const [state, setState] = useState<BankAccountViewState>(INITIAL_STATE);

  const reload = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const raw = await fetchBankAccountData();
      const { personalDetails, accounts, transactions } = mapBankData(raw);
      const results = computeResults(personalDetails, accounts, transactions);

      setState({
        status: 'success',
        personalDetails,
        accounts,
        transactions,
        results,
        error: null,
      });
    } catch (err) {
      setState({
        status: 'error',
        personalDetails: null,
        accounts: [],
        transactions: [],
        results: [],
        error: err instanceof Error ? err.message : 'Failed to load bank account data.',
      });
    }
  }, []);

  return { ...state, reload };
}
