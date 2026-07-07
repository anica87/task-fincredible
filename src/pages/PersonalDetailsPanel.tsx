import type React from "react";
import { useMemo } from "react";
import type { BankAccountSummary, PersonalDetails } from "@/types/domain.types";
import { type KeyValueItem, KeyValueList, recordToKeyValueItems } from "./KeyValueList";

export interface PersonalDetailsPanelProps {
  personalDetails: PersonalDetails | null;
  accounts: BankAccountSummary[];
}

/**
 * Renders ALL personal data (DoD: "displaying in the Personal Details all
 * personal data") — known fields first, followed by any unrecognized
 * fields the API returned, via `extra`. Account balances are shown as a
 * separate labelled section since they're bank data rather than personal
 * data, but are useful context alongside it.
 */
export function PersonalDetailsPanel({
  personalDetails,
  accounts,
}: PersonalDetailsPanelProps): React.ReactElement {
  const personalItems = useMemo<KeyValueItem[]>(() => {
    if (!personalDetails) return [];

    const known: KeyValueItem[] = [
      { label: "First name", value: personalDetails.firstName },
      { label: "Last name", value: personalDetails.lastName },
      { label: "Date of birth", value: personalDetails.dateOfBirth },
      { label: "IBAN", value: personalDetails.iban },
      { label: "Country", value: personalDetails.country },
      { label: "City", value: personalDetails.city },
      { label: "Address", value: personalDetails.address },
      { label: "Postal code", value: personalDetails.postalCode },
      { label: "Employment status", value: personalDetails.employmentStatus },
      { label: "Employer", value: personalDetails.employer },
    ].filter((item) => item.value !== undefined && item.value !== "");

    return [...known, ...recordToKeyValueItems(personalDetails.extra)];
  }, [personalDetails]);

  return (
    <div className="personal-details-panel">
      <KeyValueList
        items={personalItems}
        aria-label="Personal details"
        emptyMessage="No personal details to display."
      />

      {accounts.length > 0 ? (
        <div className="personal-details-panel__accounts">
          <h2 className="personal-details-panel__section-title">Accounts</h2>
          {accounts.map((account) => (
            <KeyValueList
              key={account.session}
              aria-label={`Account ${account.session}`}
              className="personal-details-panel__account"
              items={[
                { label: "Session", value: account.session },
                { label: "Currency", value: account.currency },
                {
                  label: "Current balance",
                  value: `${account.currentBalance.toFixed(2)} ${account.currency}`,
                },
                {
                  label: "Previous month balance",
                  value: `${account.previousMonthBalance.toFixed(2)} ${account.currency}`,
                },
              ]}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
