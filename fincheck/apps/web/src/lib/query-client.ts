import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { clearAccessToken } from "./auth-storage";
import { ApiError } from "./http-client";

function onUnauthorized(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 401) {
    return;
  }

  clearAccessToken();

  if (typeof window === "undefined") {
    return;
  }

  const currentPath = window.location.pathname;
  const isAuthPage = currentPath === "/login" || currentPath === "/register";

  if (!isAuthPage) {
    window.location.assign("/login");
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: onUnauthorized,
  }),
  mutationCache: new MutationCache({
    onError: onUnauthorized,
  }),
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
