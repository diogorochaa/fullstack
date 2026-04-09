import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken, setAccessToken } from "../../src/lib/auth-storage";
import {
  ApiError,
  getApiErrorMessage,
  httpClient,
} from "../../src/lib/http-client";

describe("httpClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds auth header and query params", async () => {
    setAccessToken("token-123");

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    const result = await httpClient<{ ok: boolean }>("/transactions", {
      params: { month: 4, year: 2026 },
    });

    expect(result).toEqual({ ok: true });

    const [url, options] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toContain("/transactions");
    expect(String(url)).toContain("month=4");
    expect(String(url)).toContain("year=2026");

    const headers = options?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("throws ApiError and clears auth token on 401", async () => {
    setAccessToken("token-123");

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: ["Invalid", "token"] }),
    } as Response);

    await expect(httpClient("/users/me")).rejects.toEqual(
      new ApiError("Invalid, token", 401),
    );
    expect(getAccessToken()).toBeNull();
  });

  it("parses string error messages without auth headers", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Bad request" }),
    } as Response);

    await expect(
      httpClient("/transactions", {
        withAuth: false,
      }),
    ).rejects.toEqual(new ApiError("Bad request", 400));
  });

  it("supports unauthenticated request and 204 response", async () => {
    setAccessToken("token-123");

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => null,
    } as Response);

    const result = await httpClient<null>("/auth/signin", {
      method: "POST",
      withAuth: false,
      body: { email: "john@doe.com", password: "12345678" },
    });

    expect(result).toBeNull();

    const [, options] = fetchMock.mock.calls[0] ?? [];
    const headers = options?.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("returns fallback message for unknown error type", () => {
    expect(getApiErrorMessage("something")).toBe(
      "Nao foi possivel concluir a operacao.",
    );
  });
});
