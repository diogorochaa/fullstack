import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const routerProviderMock = vi.fn(() => null);

vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    RouterProvider: (props: { router: unknown }) => routerProviderMock(props),
  };
});

import { Router } from "../../src/router";

describe("router entry", () => {
  it("passes the app router into RouterProvider", () => {
    render(<Router />);

    expect(routerProviderMock).toHaveBeenCalledTimes(1);
    expect(routerProviderMock.mock.calls[0]?.[0]).toHaveProperty("router");
  });
});
