import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useRootLayoutActions } from "../../src/layouts/root/actions";
import { setAccessToken } from "../../src/lib/auth-storage";
import * as api from "../../src/services/api";

vi.mock("../../src/services/api", async () => {
  const actual = await vi.importActual<typeof import("../../src/services/api")>(
    "../../src/services/api",
  );

  return {
    ...actual,
    getCurrentUser: vi.fn(),
  };
});

function createWrapper(config?: QueryClientConfig) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    ...config,
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useRootLayoutActions", () => {
  it("derives initials from current user name", async () => {
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      name: "John Doe",
      email: "john@doe.com",
    });

    const { result } = renderHook(() => useRootLayoutActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.initials).toBe("JD");
    });
  });

  it("clears token on signout action", async () => {
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      name: "Jane Doe",
      email: "jane@doe.com",
    });

    const { result } = renderHook(() => useRootLayoutActions(), {
      wrapper: createWrapper(),
    });

    setAccessToken("token-123");

    result.current.onSignOut();

    expect(window.localStorage.getItem("accessToken")).toBeNull();
  });
});
