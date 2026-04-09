import { describe, expect, it, vi } from "vitest";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../../src/lib/auth-storage";

describe("auth storage", () => {
  it("stores, reads and clears tokens in browser mode", () => {
    setAccessToken("token-123");

    expect(getAccessToken()).toBe("token-123");

    clearAccessToken();

    expect(getAccessToken()).toBeNull();
  });

  it("returns null and no-ops when window is unavailable", () => {
    const originalWindow = window;

    vi.stubGlobal("window", undefined as never);

    expect(getAccessToken()).toBeNull();
    expect(() => setAccessToken("token-123")).not.toThrow();
    expect(() => clearAccessToken()).not.toThrow();

    vi.unstubAllGlobals();
    vi.stubGlobal("window", originalWindow as never);
  });
});
