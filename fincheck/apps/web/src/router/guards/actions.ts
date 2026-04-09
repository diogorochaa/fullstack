import { useLocation } from "react-router";
import { getAccessToken } from "../../lib/auth-storage";

function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function usePrivateRouteActions() {
  const location = useLocation();

  return {
    isAuthenticated: isAuthenticated(),
    from: location,
  };
}

export function usePublicRouteActions() {
  return {
    isAuthenticated: isAuthenticated(),
  };
}
