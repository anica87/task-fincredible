import React, { useState } from 'react';
import { ReloadButton } from './ReloadButton';
import { PersonalDetailsPanel } from './PersonalDetailsPanel';
import { TransactionsTable } from './TransactionsTable';
import { ResultsTable } from './ResultsTable';
import { TabDefinition, Tabs } from '@/components/Tabs';
import { useBankAccountFacade } from '@/hooks/useBankAccountFacade';
import { BankAccountTab } from '@/types/domain.types';


/**
 * Top-level screen. Talks only to the facade — never to the api/services
 * layers directly — and composes the generic + bank-specific components.
 */
export function BankAccountView(): React.ReactElement {
  const { status, personalDetails, accounts, transactions, results, error, reload } =
    useBankAccountFacade();
  const [activeTab, setActiveTab] = useState<BankAccountTab>(BankAccountTab.PERSONAL_DETAILS);

  // DoD: no data is displayed if the token is missing / the load failed.
  const hasData = status === 'success' && personalDetails !== null;

  const tabs: TabDefinition<BankAccountTab>[] = [
    {
      key: BankAccountTab.PERSONAL_DETAILS,
      label: 'Personal Details',
      content: hasData ? (
        <PersonalDetailsPanel personalDetails={personalDetails} accounts={accounts} />
      ) : (
        <EmptyState status={status} />
      ),
    },
    {
      key: BankAccountTab.RAW_TRANSACTIONS,
      label: 'Raw Transaction History',
      content: hasData ? (
        <TransactionsTable transactions={transactions} />
      ) : (
        <EmptyState status={status} />
      ),
    },
    {
      key: BankAccountTab.RESULTS,
      label: 'Results',
      content: hasData ? <ResultsTable results={results} /> : <EmptyState status={status} />,
    },
  ];

  return (
    <section className="bank-account-view" aria-label="Bank account details">
      <header className="bank-account-view__header">
        <h1 className="bank-account-view__title">Bank Account Details</h1>
        <ReloadButton status={status} onReload={reload} />
      </header>

      {status === 'error' && error ? (
        <p role="alert" className="bank-account-view__error">
          {error}
        </p>
      ) : null}

      <Tabs<BankAccountTab> tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </section>
  );
}

function EmptyState({ status }: { status: string }): React.ReactElement {
  if (status === 'loading') {
    return <p className="bank-account-view__empty">Loading account data…</p>;
  }
  if (status === 'error') {
    return <p className="bank-account-view__empty">No data available due to the error above.</p>;
  }
  return <p className="bank-account-view__empty">Click "Load account data" to get started.</p>;
}
