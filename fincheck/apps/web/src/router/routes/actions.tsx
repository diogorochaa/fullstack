import type { RouteObject } from "react-router";
import { RootLayout } from "../../layouts/root";
import { LoginPage } from "../../pages/login";
import { NotFoundPage } from "../../pages/not-found";
import { RegisterPage } from "../../pages/register";
import { TransactionsPage } from "../../pages/transactions";
import { PrivateRoute, PublicRoute } from "../guards";

export function getAppRoutes(): RouteObject[] {
  return [
    {
      element: <PublicRoute />,
      children: [
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "register",
          element: <RegisterPage />,
        },
      ],
    },
    {
      element: <PrivateRoute />,
      children: [
        {
          path: "/",
          element: <RootLayout />,
          children: [
            {
              index: true,
              element: <TransactionsPage />,
            },
            {
              path: "transactions",
              element: <TransactionsPage />,
            },
            {
              path: "*",
              element: <NotFoundPage />,
            },
          ],
        },
      ],
    },
  ];
}
