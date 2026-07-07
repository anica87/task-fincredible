/**
 * Domain / view-model types — what components actually consume.
 * Kept separate from the raw DTOs so a change in the API shape only
 * touches the mapper layer, not the UI.
 */

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  /** ISO "YYYY-MM-DD", normalized from the API's dot-separated DOB. */
  dateOfBirth: string;
  iban: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  employmentStatus: string;
  employer: string;
  /** Any additional root-level fields returned by the API, rendered generically. */
  extra?: Record<string, unknown>;
}

/** One bank account's balance summary (a user can have more than one). */
export interface BankAccountSummary {
  session: string;
  currency: string;
  currentBalance: number;
  previousMonthBalance: number;
}

export type TransactionType = "CREDIT" | "DEBIT";

export interface Transaction {
  /** Synthesized — the API does not provide a transaction id. */
  id: string;
  date: string;
  description: string;
  /** Signed amount as returned by the API. */
  amount: number;
  currency: string;
  /** Derived from the sign of `amount`, NOT trusted from the API's `Type` field (seen to be unreliable). */
  type: TransactionType;
  /** Which account (by session) this transaction belongs to, when a user has more than one. */
  accountSession: string;
}

/** The four result rows defined by the task's "Result Definition" section. */
export enum ResultCode {
  IBAN_CHECK = "IBAN_CHECK",
  DEBT_RISK = "DEBT_RISK",
  GAMBLING = "GAMBLING",
  CHILD_SUPPORT = "CHILD_SUPPORT",
}

/** Union of every possible value a result row can take. */
export type ResultValue = "verified" | "unverified" | "HIGH" | "LOW";

export interface ResultItem {
  code: ResultCode;
  result: ResultValue;
}

/** Semantic color, so UI styling logic doesn't have to re-derive it from (code, result). */
export type ResultColor = "green" | "yellow" | "red";

export function getResultColor(item: ResultItem): ResultColor {
  switch (item.result) {
    case "verified":
    case "LOW":
      return "green";
    case "unverified":
      return "yellow";
    case "HIGH":
      return "red";
    default:
      return "yellow";
  }
}

// export enum BankAccountTab {
//   PERSONAL_DETAILS = 'PERSONAL_DETAILS',
//   RAW_TRANSACTIONS = 'RAW_TRANSACTIONS',
//   RESULTS = 'RESULTS',
// }

export const BankAccountTab = {
  PERSONAL_DETAILS: "PERSONAL_DETAILS",
  RAW_TRANSACTIONS: "RAW_TRANSACTIONS",
  RESULTS: "RESULTS",
} as const satisfies Record<string, string>;

export type BankAccountTab = (typeof BankAccountTab)[keyof typeof BankAccountTab];
// give me a type that is the union of every value in the ResultCode object.
//  That's exactly what you want a "poor man's enum" to be
//  — ResultCode.IBAN_CHECK works as a value (autocomplete, refactor-safe),
//  and ResultCode as a type means "one of these four strings," so
//  a function like computeResults(): ResultItem[] where ResultItem.code: ResultCode only accepts those four literal strings,
//  same as a real enum would.
export type LoadStatus = "idle" | "loading" | "success" | "error";

/** Full state shape exposed by the facade to components. */
export interface BankAccountViewState {
  status: LoadStatus;
  personalDetails: PersonalDetails | null;
  accounts: BankAccountSummary[];
  transactions: Transaction[];
  results: ResultItem[];
  error: string | null;
}
