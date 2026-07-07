/**
 * FINcredibleBank API configuration.
 *
 * NOTE: The API key is embedded here per the task notes. In a real production
 * app this should NOT ship in a frontend bundle — proxy the call through a
 * backend/BFF so the key never reaches the browser. Left as-is to match the
 * task instructions for this exercise.
 */
export const FIN_CREDIBLE_BANK_CONFIG = {
  apiKey: import.meta.env.VITE_POSTMAN_API_KEY,
  tokenEndpoint: "https://a0ba5803-e873-42b3-b311-665d53ea3479.mock.pstmn.io/token",
  bankDataEndpoint: "https://a0ba5803-e873-42b3-b311-665d53ea3479.mock.pstmn.io/bank-data",
  /** Header used to authenticate every request against the API. */
  apiKeyHeaderName: "x-api-key",
  /** Query param name the session token is passed as to the bank-data endpoint. */
  tokenQueryParam: "token",
} as const;
