import {
  BankAccountSummary,
  PersonalDetails,
  ResultCode,
  ResultItem,
  Transaction,
} from '../types/domain.types';

/**
 * Derives the 4 Result rows defined in the task's "Result Definition" section.
 * Keyword lists below are tuned against the sample transaction data
 * ("Online Poker", "Child allowance") — extend them if new traces show up.
 */

const GAMBLING_KEYWORDS = ['bet', 'casino', 'gambl', 'poker', 'lottery', 'slots', 'wager'];
const CHILD_SUPPORT_KEYWORDS = [
  'child allowance',
  'child support',
  'child benefit',
  'family allowance',
  'gov.',
  'government',
  'social security',
  'welfare',
];
const SALARY_KEYWORDS = ['salary', 'payroll'];

function descriptionMatches(transaction: Transaction, keywords: string[]): boolean {
  const haystack = transaction.description.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

/** IBAN_CHECK: verified if the IBAN's country prefix matches the user's country. */
function checkIban(personalDetails: PersonalDetails): ResultItem {
  const ibanCountry = (personalDetails.iban ?? '').slice(0, 2).toUpperCase();
  const userCountry = (personalDetails.country ?? '').slice(0, 2).toUpperCase();
  const verified = Boolean(ibanCountry) && ibanCountry === userCountry;

  return { code: ResultCode.IBAN_CHECK, result: verified ? 'verified' : 'unverified' };
}

/** Extracts "YYYY-MM" from an ISO-ish date string, for month-level grouping. */
function toYearMonth(date: string): string {
  return date.slice(0, 7);
}

/**
 * True if there's evidence of a recurring monthly salary: at least 2
 * salary-labelled credits landing in different months. Amount is allowed to
 * vary month to month (real salaries fluctuate) — recurrence is what matters.
 */
function hasRecurringSalary(transactions: Transaction[]): boolean {
  const salaryCredits = transactions.filter(
    (t) => t.type === 'CREDIT' && descriptionMatches(t, SALARY_KEYWORDS),
  );
  const distinctMonths = new Set(salaryCredits.map((t) => toYearMonth(t.date)));
  return distinctMonths.size >= 2;
}

/**
 * DEBT_RISK: HIGH if any account currently shows a negative balance,
 * LOW if there's evidence of a regular salary and no negative balance.
 *
 * The task spec gives two independent conditions without an explicit
 * "otherwise" case. Interpreted here as a priority order: a negative
 * balance is the strongest HIGH signal and wins outright; short of that,
 * LOW requires positive evidence of a regular salary rather than being
 * the default — no negative balance AND no salary evidence still reads
 * as HIGH (insufficient evidence of stable income). Flag to the Tech Lead
 * if a different tie-break is intended.
 */
function checkDebtRisk(accounts: BankAccountSummary[], transactions: Transaction[]): ResultItem {
  const hasNegativeBalance = accounts.some((account) => account.currentBalance < 0);
  if (hasNegativeBalance) {
    return { code: ResultCode.DEBT_RISK, result: 'HIGH' };
  }

  return {
    code: ResultCode.DEBT_RISK,
    result: hasRecurringSalary(transactions) ? 'LOW' : 'HIGH',
  };
}

/** GAMBLING: verified if any transaction shows traces of gambling activity. */
function checkGambling(transactions: Transaction[]): ResultItem {
  const verified = transactions.some((t) => descriptionMatches(t, GAMBLING_KEYWORDS));
  return { code: ResultCode.GAMBLING, result: verified ? 'verified' : 'unverified' };
}

/** CHILD_SUPPORT: verified if any transaction shows traces of government/child support. */
function checkChildSupport(transactions: Transaction[]): ResultItem {
  const verified = transactions.some((t) => descriptionMatches(t, CHILD_SUPPORT_KEYWORDS));
  return { code: ResultCode.CHILD_SUPPORT, result: verified ? 'verified' : 'unverified' };
}

export function computeResults(
  personalDetails: PersonalDetails,
  accounts: BankAccountSummary[],
  transactions: Transaction[],
): ResultItem[] {
  return [
    checkIban(personalDetails),
    checkDebtRisk(accounts, transactions),
    checkGambling(transactions),
    checkChildSupport(transactions),
  ];
}
