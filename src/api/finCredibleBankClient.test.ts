import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchBankAccountData, fetchBankData, fetchSessionToken } from "./finCredibleBankClient";

function jsonResponse(body: unknown, init: Partial<Response> = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? "OK",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("fetchSessionToken", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the session token on a valid response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ session: "abc-123" }));

    const token = await fetchSessionToken();

    expect(token).toBe("abc-123");
  });

  it("throws with the response status when the request is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({}, { ok: false, status: 401, statusText: "Unauthorized" }),
    );

    await expect(fetchSessionToken()).rejects.toThrow(/401/);
  });

  it("throws a descriptive error when the session field is missing or empty", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ session: "" }));

    await expect(fetchSessionToken()).rejects.toThrow(/no string "token" field/);
  });
});

describe("fetchBankData", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refuses to call the endpoint without a token", async () => {
    await expect(fetchBankData("")).rejects.toThrow(/Missing session token/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("passes the token as a query param and returns the parsed body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ Name: "Jane" }));

    const result = await fetchBankData("abc-123");

    expect(result).toEqual({ Name: "Jane" });
    const calledUrl = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get("token")).toBe("abc-123");
  });
});

describe("fetchBankAccountData", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("orchestrates token fetch then bank-data fetch, in order", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ session: "abc-123" }))
      .mockResolvedValueOnce(jsonResponse({ Name: "Jane" }));

    const result = await fetchBankAccountData();

    expect(result).toEqual({ Name: "Jane" });
    expect(fetch).toHaveBeenCalledTimes(2);
    const secondCallUrl = new URL(vi.mocked(fetch).mock.calls[1][0] as string);
    expect(secondCallUrl.searchParams.get("token")).toBe("abc-123");
  });

  it("propagates a token-fetch failure without calling bank-data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({}, { ok: false, status: 500, statusText: "Server Error" }),
    );

    await expect(fetchBankAccountData()).rejects.toThrow(/500/);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
