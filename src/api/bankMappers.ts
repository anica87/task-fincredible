import type { BankDataResponseDto, RawAccountDto } from '../types/api.types';
import type { BankAccountSummary, PersonalDetails, Transaction } from '../types/domain.types';

const KNOWN_ROOT_KEYS = [
  'Name',
  'LastName',
  'DOB',
  'IBAN',
  'Country',
  'City',
  'Address',
  'PostalCode',
  'EmploymentStatus',
  'Employer',
  'Accounts',
];

/** "1980.10.29" -> "1980-10-29". Falls back to the raw string if it doesn't match. */
export function normalizeDob(dob: string): string {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(dob);
  if (!match) return dob;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

/** API sends balances as numeric strings (e.g. "-335"). Non-numeric input safely falls back to 0. */
export function parseBalance(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapPersonalDetails(dto: BankDataResponseDto): PersonalDetails {
  const extra: Record<string, unknown> = {};
  Object.keys(dto).forEach((key) => {
    if (!KNOWN_ROOT_KEYS.includes(key)) {
      extra[key] = dto[key];
    }
  });

  return {
    firstName: dto.Name,
    lastName: dto.LastName,
    dateOfBirth: normalizeDob(dto.DOB),
    iban: dto.IBAN,
    country: dto.Country,
    city: dto.City,
    address: dto.Address,
    postalCode: dto.PostalCode,
    employmentStatus: dto.EmploymentStatus,
    employer: dto.Employer,
    extra: Object.keys(extra).length > 0 ? extra : undefined,
  };
}

export function mapAccounts(rawAccounts: RawAccountDto[]): BankAccountSummary[] {
  return rawAccounts.map((account) => ({
    session: account.Session,
    currency: account.AccountCurrency,
    currentBalance: parseBalance(account.CurrentBalance),
    previousMonthBalance: parseBalance(account.PreviousMonthBalance),
  }));
}

/**
 * Flattens every account's transactions into a single list, tagged with
 * the owning account's session + currency.
 *
 * `type` is derived from the sign of `Amount`, not the API's `Type` field —
 * the sample data has at least one "deposit" with a negative amount, so
 * `Type` cannot be trusted as the source of truth.
 */
export function mapTransactions(rawAccounts: RawAccountDto[]): Transaction[] {
  return rawAccounts.flatMap((account) =>
    account.Transactions.map((transaction, index) => ({
      id: `${account.Session}-${index}`,
      date: transaction.Date,
      description: transaction.Description,
      amount: transaction.Amount,
      currency: account.AccountCurrency,
      type: transaction.Amount < 0 ? 'DEBIT' : ('CREDIT' as const),
      accountSession: account.Session,
    })),
  );
}

export function mapBankData(dto: BankDataResponseDto): {
  personalDetails: PersonalDetails;
  accounts: BankAccountSummary[];
  transactions: Transaction[];
} {
  const accounts = dto.Accounts ?? [];

  return {
    personalDetails: mapPersonalDetails(dto),
    accounts: mapAccounts(accounts),
    transactions: mapTransactions(accounts),
  };
}
