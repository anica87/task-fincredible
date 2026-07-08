import { describe, expect, it } from "vitest";
import type { BankDataResponseDto, RawAccountDto } from "@/types/api.types";
import {
  mapAccounts,
  mapBankData,
  mapPersonalDetails,
  mapTransactions,
  normalizeDob,
  parseBalance,
} from "./bankMappers";

describe("normalizeDob", () => {
  it("converts dot-separated YYYY.MM.DD to ISO YYYY-MM-DD", () => {
    expect(normalizeDob("1980.10.29")).toBe("1980-10-29");
  });

  it("falls back to the raw string when the format doesn't match", () => {
    expect(normalizeDob("29/10/1980")).toBe("29/10/1980");
    expect(normalizeDob("")).toBe("");
  });
});

describe("parseBalance", () => {
  it("parses numeric strings, including negatives", () => {
    expect(parseBalance("-335")).toBe(-335);
    expect(parseBalance("2478")).toBe(2478);
    expect(parseBalance("0")).toBe(0);
  });

  it("falls back to 0 for non-numeric input", () => {
    expect(parseBalance("not-a-number")).toBe(0);
    expect(parseBalance("")).toBe(0);
  });
});

const baseAccountDto: RawAccountDto = {
  Session: "session-1",
  AccountCurrency: "EUR",
  CurrentBalance: "-335",
  PreviousMonthBalance: "2478",
  Transactions: [
    { Date: "2024-01-05", Type: "deposit", Description: "Salary payment", Amount: 2000 },
    { Date: "2024-02-01", Type: "debit", Description: "Rent", Amount: -900 },
    // Sample data has been seen to mislabel Type — Amount's sign is the
    // source of truth, so this should still map to DEBIT.
    { Date: "2024-02-03", Type: "deposit", Description: "Suspicious", Amount: -50 },
  ],
};

const baseBankDataDto: BankDataResponseDto = {
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
  Accounts: [baseAccountDto],
};

describe("mapPersonalDetails", () => {
  it("maps root-level DTO fields to the domain shape", () => {
    const result = mapPersonalDetails(baseBankDataDto);

    expect(result).toMatchObject({
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
    });
  });

  it("collects unknown root fields into `extra`", () => {
    const dto = { ...baseBankDataDto, RiskScore: 42, Notes: "flagged" };
    const result = mapPersonalDetails(dto);

    expect(result.extra).toEqual({ RiskScore: 42, Notes: "flagged" });
  });

  it("leaves `extra` undefined when there are no unknown fields", () => {
    const result = mapPersonalDetails(baseBankDataDto);
    expect(result.extra).toBeUndefined();
  });
});

describe("mapAccounts", () => {
  it("maps raw account DTOs to domain summaries, parsing balances", () => {
    const result = mapAccounts([baseAccountDto]);

    expect(result).toEqual([
      {
        session: "session-1",
        currency: "EUR",
        currentBalance: -335,
        previousMonthBalance: 2478,
      },
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(mapAccounts([])).toEqual([]);
  });
});

describe("mapTransactions", () => {
  it("flattens transactions across accounts and tags them with the account session", () => {
    const result = mapTransactions([baseAccountDto]);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      id: "session-1-0",
      date: "2024-01-05",
      description: "Salary payment",
      amount: 2000,
      currency: "EUR",
      type: "CREDIT",
      accountSession: "session-1",
    });
  });

  it("derives type from the sign of Amount, not the API's Type field", () => {
    const result = mapTransactions([baseAccountDto]);

    // Labelled "debit" with a negative amount -> DEBIT (consistent).
    expect(result[1].type).toBe("DEBIT");
    // Labelled "deposit" but with a negative amount -> DEBIT, because the
    // mapper trusts Amount's sign over the (unreliable) Type field.
    expect(result[2].type).toBe("DEBIT");
  });

  it("generates unique, stable ids per account since the API provides none", () => {
    const result = mapTransactions([baseAccountDto]);
    const ids = result.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("mapBankData", () => {
  it("combines personal details, accounts, and transactions from a single DTO", () => {
    const result = mapBankData(baseBankDataDto);

    expect(result.personalDetails.firstName).toBe("Jane");
    expect(result.accounts).toHaveLength(1);
    expect(result.transactions).toHaveLength(3);
  });

  it("handles a missing Accounts array without throwing", () => {
    const { Accounts, ...rest } = baseBankDataDto;
    const result = mapBankData(rest as BankDataResponseDto);

    expect(result.accounts).toEqual([]);
    expect(result.transactions).toEqual([]);
  });
});
