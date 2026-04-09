import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "../../src/services/api";

const httpClientMock = vi.fn();

vi.mock("../../src/lib/http-client", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

describe("api services", () => {
  afterEach(() => {
    httpClientMock.mockReset();
  });

  it.each([
    [
      "signup",
      () =>
        api.signup({
          name: "John Doe",
          email: "john@doe.com",
          password: "12345678",
        }),
      "/auth/signup",
      {
        method: "POST",
        body: {
          name: "John Doe",
          email: "john@doe.com",
          password: "12345678",
        },
        withAuth: false,
      },
    ],
    [
      "signin",
      () => api.signin({ email: "john@doe.com", password: "12345678" }),
      "/auth/signin",
      {
        method: "POST",
        body: { email: "john@doe.com", password: "12345678" },
        withAuth: false,
      },
    ],
    ["getCurrentUser", () => api.getCurrentUser(), "/users/me", undefined],
    [
      "getBankAccounts",
      () => api.getBankAccounts(),
      "/bank-accounts",
      undefined,
    ],
    [
      "createBankAccount",
      () =>
        api.createBankAccount({
          name: "Nubank",
          initialBalance: 1200,
          type: "CHECKING",
          color: "#7c3aed",
        }),
      "/bank-accounts",
      {
        method: "POST",
        body: {
          name: "Nubank",
          initialBalance: 1200,
          type: "CHECKING",
          color: "#7c3aed",
        },
      },
    ],
    ["getCategories", () => api.getCategories(), "/categories", undefined],
    [
      "createCategory",
      () =>
        api.createCategory({
          name: "Investimentos",
          type: "INCOME",
          icon: "tag",
        }),
      "/categories",
      {
        method: "POST",
        body: {
          name: "Investimentos",
          type: "INCOME",
          icon: "tag",
        },
      },
    ],
    [
      "getTransactions",
      () =>
        api.getTransactions({
          month: 4,
          year: 2026,
          bankAccountId: "acc-1",
          type: "EXPENSE",
        }),
      "/transactions",
      {
        params: {
          month: 4,
          year: 2026,
          bankAccountId: "acc-1",
          type: "EXPENSE",
        },
      },
    ],
    [
      "createTransaction",
      () =>
        api.createTransaction({
          bankAccountId: "acc-1",
          categoryId: "cat-1",
          name: "Compra",
          value: 50,
          date: "2026-04-03T00:00:00.000Z",
          type: "EXPENSE",
        }),
      "/transactions",
      {
        method: "POST",
        body: {
          bankAccountId: "acc-1",
          categoryId: "cat-1",
          name: "Compra",
          value: 50,
          date: "2026-04-03T00:00:00.000Z",
          type: "EXPENSE",
        },
      },
    ],
  ])(
    "calls %s with the expected contract",
    async (_label, action, path, options) => {
      httpClientMock.mockResolvedValue({});

      await action();

      if (options === undefined) {
        expect(httpClientMock).toHaveBeenCalledWith(path);
        return;
      }

      expect(httpClientMock).toHaveBeenCalledWith(path, options);
    },
  );
});
