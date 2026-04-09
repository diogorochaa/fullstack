import { usePrivateRouteActions, usePublicRouteActions } from "./actions";
import { PrivateRouteView, PublicRouteView } from "./view";

export function PrivateRoute() {
  const ui = usePrivateRouteActions();

  return <PrivateRouteView ui={ui} />;
}

export function PublicRoute() {
  const ui = usePublicRouteActions();

  return <PublicRouteView ui={ui} />;
}
