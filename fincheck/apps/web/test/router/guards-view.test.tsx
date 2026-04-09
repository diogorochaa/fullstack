import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import {
  PrivateRouteView,
  PublicRouteView,
} from "../../src/router/guards/view";

describe("route guards view", () => {
  it("redirects unauthenticated user to login in private route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRouteView
                ui={{
                  isAuthenticated: false,
                  from: { pathname: "/" } as never,
                }}
              />
            }
          >
            <Route index element={<p>private content</p>} />
          </Route>
          <Route path="/login" element={<p>login page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("login page")).toBeTruthy();
  });

  it("renders outlet for authenticated private route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRouteView
                ui={{
                  isAuthenticated: true,
                  from: { pathname: "/" } as never,
                }}
              />
            }
          >
            <Route index element={<p>private content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("private content")).toBeTruthy();
  });

  it("renders outlet for unauthenticated public route", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={<PublicRouteView ui={{ isAuthenticated: false }} />}
          >
            <Route index element={<p>public content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("public content")).toBeTruthy();
  });
});
