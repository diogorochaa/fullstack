import { Navigate, Outlet } from "react-router";
import type { usePrivateRouteActions, usePublicRouteActions } from "./actions";

type PrivateRouteViewProps = {
  ui: ReturnType<typeof usePrivateRouteActions>;
};

type PublicRouteViewProps = {
  ui: ReturnType<typeof usePublicRouteActions>;
};

export function PrivateRouteView({ ui }: PrivateRouteViewProps) {
  if (!ui.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: ui.from }} />;
  }

  return <Outlet />;
}

export function PublicRouteView({ ui }: PublicRouteViewProps) {
  if (ui.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
