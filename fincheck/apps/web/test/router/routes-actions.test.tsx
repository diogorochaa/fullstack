import { describe, expect, it } from "vitest";
import { getAppRoutes } from "../../src/router/routes/actions";

describe("app routes", () => {
  it("builds the expected route tree", () => {
    const routes = getAppRoutes();

    expect(routes).toHaveLength(2);
    expect(routes[0]?.children?.map((route) => route.path)).toEqual([
      "login",
      "register",
    ]);
    expect(routes[1]?.children?.[0]?.path).toBe("/");
    expect(
      routes[1]?.children?.[0]?.children?.map((route) => route.path ?? "index"),
    ).toEqual(["index", "transactions", "*"]);
  });
});
