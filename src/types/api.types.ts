/**
 * Raw DTOs — shapes as returned by the FINcredibleBank API.
 *
 * ASSUMPTION: I could not reach the live Postman mock server from this
 * environment to sample a real payload, so these are modelled directly off
 * the task's Definition of Done / Result Definition. Field names marked
 * "confirm" should be checked against a real response and adjusted in this
 * single file — the rest of the app only depends on these types plus the
 * mappers in `services/bankMappers.ts`, so a shape mismatch is a one-file fix.
 */

/** GET /token response */
export interface TokenResponseDto {
session: string;
}

/**
 * A single raw transaction line.
 * NOTE: `Type` ("debit" | "deposit") is not fully reliable in the sample
 * data (seen a "deposit" with a negative Amount) — treat `Amount`'s sign
 * as the source of truth, `Type` as a hint only.
 */
export interface RawTransactionDto {
  Date: string; // "YYYY-MM-DD"
  Type: 'debit' | 'deposit' | string;
  Description: string;
  Amount: number; // signed: negative = money out, positive = money in
}

/** A single bank account under the user, with its own balance + transactions. */
export interface RawAccountDto {
  Session: string; // matches the token passed as ?token= to this same endpoint
  AccountCurrency: string;
  CurrentBalance: string; // numeric string, e.g. "-335"
  PreviousMonthBalance: string; // numeric string, e.g. "2478"
  Transactions: RawTransactionDto[];
}

/** GET /bank-data?token=... response — personal fields at the root + Accounts[]. */
export interface BankDataResponseDto {
  Name: string;
  LastName: string;
  DOB: string; // "YYYY.MM.DD" (dot-separated)
  IBAN: string;
  Country: string; // 2-letter country code, e.g. "AT" — compared against IBAN prefix
  City: string;
  Address: string;
  PostalCode: string;
  EmploymentStatus: string;
  Employer: string;
  Accounts: RawAccountDto[];
  [key: string]: unknown; // tolerate any additional fields the API may add
}
