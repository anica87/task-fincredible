

/**
 * Thin, framework-agnostic API layer for FINcredibleBank.
 * No React here — the facade hook is the only consumer.
 */

import { FIN_CREDIBLE_BANK_CONFIG } from "@/config";
import { BankDataResponseDto, TokenResponseDto } from "@/types/api.types";

async function parseJsonOrThrow<T>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `${context} failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`,
    );
  }
  return (await res.json()) as T;
}

/** GET /token — every request is authenticated via the x-api-key header. */
export async function fetchSessionToken(): Promise<string> {
  const res = await fetch(FIN_CREDIBLE_BANK_CONFIG.tokenEndpoint, {
    method: 'GET',
    headers: {
      [FIN_CREDIBLE_BANK_CONFIG.apiKeyHeaderName]: FIN_CREDIBLE_BANK_CONFIG.apiKey,
    },
  });

  const data = await parseJsonOrThrow<TokenResponseDto>(res, 'Fetching session token');

  // Fail loudly with the actual payload if the response doesn't match
  // TokenResponseDto — otherwise `data.token` silently becomes `undefined`,
  // fetchBankData() rejects it as "missing", and the flow stops after this
  // single request with a misleading error. If this fires, check the real
  // field name in `data` and update TokenResponseDto in api.types.ts.
console.log(data)

  if (typeof data?.session !== 'string' || data.session.length === 0) {
    throw new Error(
      `Token endpoint responded but no string "token" field was found. ` +
        `Raw response: ${JSON.stringify(data)}`,
    );
  }

  return data.session;
}

/**
 * GET /bank-data?token=... — the session token is passed as the `token`
 * query param, and the request is still authenticated via x-api-key.
 *
 * Per the DoD ("not displaying any data if the token is missing from the
 * request"), this throws rather than silently calling the endpoint without
 * a token.
 */
export async function fetchBankData(token: string): Promise<BankDataResponseDto> {
  if (!token) {
    throw new Error('Missing session token — refusing to call bank-data endpoint.');
  }

  const url = new URL(FIN_CREDIBLE_BANK_CONFIG.bankDataEndpoint);
  url.searchParams.set(FIN_CREDIBLE_BANK_CONFIG.tokenQueryParam, token);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      [FIN_CREDIBLE_BANK_CONFIG.apiKeyHeaderName]: FIN_CREDIBLE_BANK_CONFIG.apiKey,
    },
  });

  return parseJsonOrThrow<BankDataResponseDto>(res, 'Fetching bank data');
}

/** Orchestrates the full flow: get a session token, then fetch bank data with it. */
export async function fetchBankAccountData(): Promise<BankDataResponseDto> {
  const token = await fetchSessionToken();
  return fetchBankData(token);
}