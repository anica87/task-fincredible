import { describe, expect, it } from "vitest";
import {
  type BankAccountSummary,
  type PersonalDetails,
  ResultCode,
  type Transaction,
} from "@/types/domain.types";
import { computeResults } from "./bankResultsService";

const personalDetails: PersonalDetails = {
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
};

const account = (overrides: Partial<BankAccountSummary> = {}): BankAccountSummary => ({
  session: "session-1",
  currency: "EUR",
  currentBalance: 1000,
  previousMonthBalance: 1000,
  ...overrides,
});

const transaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "t1",
  date: "2024-01-05",
  description: "Misc",
  amount: 100,
  currency: "EUR",
  type: "CREDIT",
  accountSession: "session-1",
  ...overrides,
});

function resultFor(code: ResultCode, results: ReturnType<typeof computeResults>) {
  return results.find((r) => r.code === code)?.result;
}

describe("computeResults — IBAN_CHECK", () => {
  it("is verified when the IBAN prefix matches the user's country", () => {
    const results = computeResults(personalDetails, [account()], []);
    expect(resultFor(ResultCode.IBAN_CHECK, results)).toBe("verified");
  });

  it("is unverified when the IBAN prefix does not match", () => {
    const results = computeResults({ ...personalDetails, country: "DE" }, [account()], []);
    expect(resultFor(ResultCode.IBAN_CHECK, results)).toBe("unverified");
  });

  it("is unverified when the IBAN is missing", () => {
    const results = computeResults({ ...personalDetails, iban: "" }, [account()], []);
    expect(resultFor(ResultCode.IBAN_CHECK, results)).toBe("unverified");
  });
});

describe("computeResults — DEBT_RISK", () => {
  it("is HIGH when any account has a negative current balance", () => {
    const results = computeResults(
      personalDetails,
      [account({ currentBalance: -50 })],
      [
        transaction({ description: "Salary payment", type: "CREDIT", date: "2024-01-05" }),
        transaction({ description: "Salary payment", type: "CREDIT", date: "2024-02-05" }),
      ],
    );
    // Negative balance wins outright, even with salary evidence present.
    expect(resultFor(ResultCode.DEBT_RISK, results)).toBe("HIGH");
  });

  it("is LOW when balances are non-negative and salary recurs across 2+ months", () => {
    const results = computeResults(
      personalDetails,
      [account({ currentBalance: 500 })],
      [
        transaction({ description: "Salary payment", type: "CREDIT", date: "2024-01-05" }),
        transaction({ description: "Salary payment", type: "CREDIT", date: "2024-02-05" }),
      ],
    );
    expect(resultFor(ResultCode.DEBT_RISK, results)).toBe("LOW");
  });

  it("is HIGH when balances are non-negative but there's no recurring salary evidence", () => {
    const results = computeResults(personalDetails, [account({ currentBalance: 500 })], []);
    expect(resultFor(ResultCode.DEBT_RISK, results)).toBe("HIGH");
  });

  it("does not count a single salary credit as recurring (needs 2+ distinct months)", () => {
    const results = computeResults(
      personalDetails,
      [account({ currentBalance: 500 })],
      [transaction({ description: "Salary payment", type: "CREDIT", date: "2024-01-05" })],
    );
    expect(resultFor(ResultCode.DEBT_RISK, results)).toBe("HIGH");
  });

  it("ignores salary-labelled transactions that are debits, not credits", () => {
    const results = computeResults(
      personalDetails,
      [account({ currentBalance: 500 })],
      [
        transaction({ description: "Salary payment", type: "DEBIT", date: "2024-01-05" }),
        transaction({ description: "Salary payment", type: "DEBIT", date: "2024-02-05" }),
      ],
    );
    expect(resultFor(ResultCode.DEBT_RISK, results)).toBe("HIGH");
  });
});

describe("computeResults — GAMBLING", () => {
  it("is verified when a transaction description matches a gambling keyword", () => {
    const results = computeResults(
      personalDetails,
      [account()],
      [transaction({ description: "Online Poker" })],
    );
    expect(resultFor(ResultCode.GAMBLING, results)).toBe("verified");
  });

  it("is case-insensitive", () => {
    const results = computeResults(
      personalDetails,
      [account()],
      [transaction({ description: "CASINO ROYALE" })],
    );
    expect(resultFor(ResultCode.GAMBLING, results)).toBe("verified");
  });

  it("is unverified when no transaction matches", () => {
    const results = computeResults(
      personalDetails,
      [account()],
      [transaction({ description: "Grocery store" })],
    );
    expect(resultFor(ResultCode.GAMBLING, results)).toBe("unverified");
  });
});

describe("computeResults — CHILD_SUPPORT", () => {
  it("is verified when a transaction matches a child-support keyword", () => {
    const results = computeResults(
      personalDetails,
      [account()],
      [transaction({ description: "Child allowance" })],
    );
    expect(resultFor(ResultCode.CHILD_SUPPORT, results)).toBe("verified");
  });

  it("is unverified when no transaction matches", () => {
    const results = computeResults(
      personalDetails,
      [account()],
      [transaction({ description: "Grocery store" })],
    );
    expect(resultFor(ResultCode.CHILD_SUPPORT, results)).toBe("unverified");
  });
});

describe("computeResults", () => {
  it("always returns exactly the 4 result rows defined by the task", () => {
    const results = computeResults(personalDetails, [account()], []);
    expect(results.map((r) => r.code).sort()).toEqual(
      [
        ResultCode.IBAN_CHECK,
        ResultCode.DEBT_RISK,
        ResultCode.GAMBLING,
        ResultCode.CHILD_SUPPORT,
      ].sort(),
    );
  });
});
