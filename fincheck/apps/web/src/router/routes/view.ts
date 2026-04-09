import { createBrowserRouter, type RouteObject } from "react-router";

export function createAppRouter(routes: RouteObject[]) {
  return createBrowserRouter(routes);
}
