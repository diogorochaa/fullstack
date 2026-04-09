import { useQuery } from "@tanstack/react-query";
import { clearAccessToken } from "../../lib/auth-storage";
import { getCurrentUser } from "../../services/api";
import { queryKeys } from "../../services/query-keys";

export type RootLayoutActions = {
  brandName: string;
  initials: string;
  onSignOut: () => void;
};

export function useRootLayoutActions(): RootLayoutActions {
  const currentUserQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
  });

  const initials =
    currentUserQuery.data?.name
      ?.split(" ")
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("") ?? "--";

  return {
    brandName: "fincheck",
    initials,
    onSignOut: () => {
      clearAccessToken();
      window.location.href = "/login";
    },
  };
}
