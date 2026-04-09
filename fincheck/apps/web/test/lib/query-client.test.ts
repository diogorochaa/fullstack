import { describe, expect, it, vi } from "vitest";
import { getAccessToken, setAccessToken } from "../../src/lib/auth-storage";
import { ApiError } from "../../src/lib/http-client";
import { queryClient } from "../../src/lib/query-client";

describe("queryClient unauthorized handling", () => {
  it("clears token on query 401 error", () => {
    setAccessToken("token-123");

    const onError = (
      queryClient.getQueryCache() as unknown as {
        config: { onError?: (error: unknown) => void };
      }
    ).config.onError;

    onError?.(new ApiError("Unauthorized", 401));

    expect(getAccessToken()).toBeNull();
  });

  it("does not clear token on non-401 mutation error", () => {
    setAccessToken("token-123");

    const onError = (
      queryClient.getMutationCache() as unknown as {
        config: { onError?: (error: unknown) => void };
      }
    ).config.onError;

    onError?.(new ApiError("Forbidden", 403));

    expect(getAccessToken()).toBe("token-123");
  });

  it("skips redirect on auth route and handles no-window 401", () => {
    const originalWindow = window;

    window.history.pushState({}, "", "/login");

    setAccessToken("token-123");

    const onError = (
      queryClient.getMutationCache() as unknown as {
        config: { onError?: (error: unknown) => void };
      }
    ).config.onError;

    onError?.(new ApiError("Unauthorized", 401));

    expect(getAccessToken()).toBeNull();

    vi.stubGlobal("window", undefined as never);

    setAccessToken("token-123");
    onError?.(new ApiError("Unauthorized", 401));

    expect(getAccessToken()).toBeNull();

    vi.unstubAllGlobals();
    vi.stubGlobal("window", originalWindow as never);
  });
});
