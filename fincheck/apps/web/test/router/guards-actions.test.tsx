import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { setAccessToken } from "../../src/lib/auth-storage";
import {
  usePrivateRouteActions,
  usePublicRouteActions,
} from "../../src/router/guards/actions";

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("route guards actions", () => {
  it("detects private route auth state from storage", () => {
    setAccessToken("token-123");

    const { result } = renderHook(() => usePrivateRouteActions(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.from).toBeTruthy();
  });

  it("detects public route auth state from storage", () => {
    const { result } = renderHook(() => usePublicRouteActions(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
