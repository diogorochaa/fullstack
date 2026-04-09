import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { useTransactionsPageActions } from "../../src/pages/transactions/actions";
import * as api from "../../src/services/api";

vi.mock("../../src/services/api", async () => {
  const actual = await vi.importActual<typeof import("../../src/services/api")>(
    "../../src/services/api",
  );

  return {
    ...actual,
    getBankAccounts: vi.fn(),
    getCategories: vi.fn(),
    getTransactions: vi.fn(),
    createBankAccount: vi.fn(),
    createTransaction: vi.fn(),
    createCategory: vi.fn(),
    deleteTransaction: vi.fn(),
    updateBankAccount: vi.fn(),
  };
});

function createWrapper(config?: QueryClientConfig) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
    ...config,
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    );
  };
}

describe("useTransactionsPageActions", () => {
  it("only applies draft account/year filters after applyFilters", async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    vi.mocked(api.getBankAccounts).mockResolvedValue([
      {
        id: "acc-1",
        userId: "user-1",
        name: "Nubank",
        initialBalance: 1000,
        currentBalance: 1200,
        type: "CHECKING",
        color: "#7c3aed",
      },
    ]);

    vi.mocked(api.getCategories).mockResolvedValue([
      {
        id: "cat-1",
        userId: "user-1",
        name: "Salario",
        icon: "wallet",
        type: "INCOME",
      },
    ]);

    vi.mocked(api.getTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useTransactionsPageActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(api.getTransactions).mock.calls[0]?.[0]).toMatchObject({
      year: currentYear,
      bankAccountId: undefined,
    });

    act(() => {
      result.current.openFilterCard();
      result.current.setDraftFilterBankAccountId("acc-1");
      result.current.setDraftFilterPeriod(
        `${currentYear + 1}-${String(currentMonth).padStart(2, "0")}`,
      );
    });

    expect(api.getTransactions).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.applyFilters();
    });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledTimes(2);
    });

    expect(vi.mocked(api.getTransactions).mock.calls[1]?.[0]).toMatchObject({
      year: currentYear + 1,
      month: currentMonth,
      bankAccountId: "acc-1",
    });
  });

  it("creates a transaction using selected account and category", async () => {
    vi.mocked(api.getBankAccounts).mockResolvedValue([
      {
        id: "acc-2",
        userId: "user-1",
        name: "Carteira",
        initialBalance: 100,
        currentBalance: 100,
        type: "CASH",
        color: "#22c55e",
      },
    ]);

    vi.mocked(api.getCategories).mockResolvedValue([
      {
        id: "cat-expense",
        userId: "user-1",
        name: "Mercado",
        icon: "bag",
        type: "EXPENSE",
      },
    ]);

    vi.mocked(api.getTransactions).mockResolvedValue([]);
    vi.mocked(api.createTransaction).mockResolvedValue({
      id: "tr-1",
      userId: "user-1",
      bankAccountId: "acc-2",
      categoryId: "cat-expense",
      value: 50,
      date: new Date().toISOString(),
      name: "Compra",
      type: "EXPENSE",
    });

    const { result } = renderHook(() => useTransactionsPageActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.getCategories).toHaveBeenCalled();
      expect(api.getBankAccounts).toHaveBeenCalled();
    });

    act(() => {
      result.current.onCreateOptionSelect("new-expense");
    });

    await waitFor(() => {
      expect(result.current.createCardType).toBe("new-expense");
    });

    act(() => {
      result.current.setCreateName("Compra mercado");
      result.current.setCreateAmount("50,00");
      result.current.setCreateDate("2026-04-10");
      result.current.setCreateSelectedBankAccountId("acc-2");
      result.current.setCreateSelectedCategoryId("cat-expense");
    });

    act(() => {
      result.current.onCreateSave();
    });

    await waitFor(() => {
      expect(api.createTransaction).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(api.createTransaction).mock.calls[0]?.[0]).toMatchObject({
      bankAccountId: "acc-2",
      categoryId: "cat-expense",
      name: "Compra mercado",
      value: 50,
      date: "2026-04-10T00:00:00.000Z",
      type: "EXPENSE",
    });
  });

  it("updates page title and chip label when changing active filter", async () => {
    vi.mocked(api.getBankAccounts).mockResolvedValue([]);
    vi.mocked(api.getCategories).mockResolvedValue([]);
    vi.mocked(api.getTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useTransactionsPageActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setActiveFilter("income");
    });

    expect(result.current.pageTitle).toBe("Receitas");
    expect(result.current.activeFilterChips.at(-1)?.label).toBe(
      "Tipo: Receitas",
    );

    act(() => {
      result.current.setActiveFilter("expense");
    });

    expect(result.current.pageTitle).toBe("Despesas");
    expect(result.current.activeFilterChips.at(-1)?.label).toBe(
      "Tipo: Despesas",
    );
  });

  it("creates a category from the create dialog", async () => {
    vi.mocked(api.getBankAccounts).mockResolvedValue([]);
    vi.mocked(api.getCategories).mockResolvedValue([]);
    vi.mocked(api.getTransactions).mockResolvedValue([]);
    vi.mocked(api.createCategory).mockResolvedValue({
      id: "cat-2",
      userId: "user-1",
      name: "Freelance",
      icon: "tag",
      type: "INCOME",
    });

    const { result } = renderHook(() => useTransactionsPageActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.getTransactions).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.onCreateOptionSelect("new-category");
      result.current.setCreateName("Freelance");
      result.current.setCreateSelectedCategoryType("INCOME");
      result.current.setCreateSelectedCategoryIcon("wallet");
    });

    act(() => {
      result.current.onCreateSave();
    });

    await waitFor(() => {
      expect(api.createCategory).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(api.createCategory).mock.calls[0]?.[0]).toEqual({
      name: "Freelance",
      type: "INCOME",
      icon: "wallet",
    });
  });

  it("deletes a transaction from the list", async () => {
    vi.mocked(api.getBankAccounts).mockResolvedValue([]);
    vi.mocked(api.getCategories).mockResolvedValue([]);
    vi.mocked(api.getTransactions).mockResolvedValue([
      {
        id: "tr-1",
        userId: "user-1",
        bankAccountId: "acc-1",
        categoryId: null,
        value: 50,
        date: "2026-04-10T00:00:00.000Z",
        name: "Cafe",
        type: "EXPENSE",
      },
    ]);
    vi.mocked(api.deleteTransaction).mockResolvedValue(null);

    const { result } = renderHook(() => useTransactionsPageActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.filteredTransactions).toHaveLength(1);
    });

    act(() => {
      result.current.onDeleteTransaction("tr-1");
    });

    await waitFor(() => {
      expect(api.deleteTransaction).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(api.deleteTransaction).mock.calls[0]?.[0]).toBe("tr-1");
  });

  it("edits an account from card interaction", async () => {
    vi.mocked(api.getBankAccounts).mockResolvedValue([
      {
        id: "acc-1",
        userId: "user-1",
        name: "Nubank",
        initialBalance: 1000,
        currentBalance: 1200,
        type: "CHECKING",
        color: "#7c3aed",
      },
    ]);
    vi.mocked(api.getCategories).mockResolvedValue([]);
    vi.mocked(api.getTransactions).mockResolvedValue([]);
    vi.mocked(api.updateBankAccount).mockResolvedValue({
      id: "acc-1",
      userId: "user-1",
      name: "Nubank PJ",
      initialBalance: 1500,
      currentBalance: 1700,
      type: "CHECKING",
      color: "#7c3aed",
    });

    const { result } = renderHook(() => useTransactionsPageActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.accountCards).toHaveLength(1);
    });

    act(() => {
      result.current.onEditAccount("acc-1");
    });

    act(() => {
      result.current.setCreateName("Nubank PJ");
      result.current.setCreateAmount("1500");
    });

    act(() => {
      result.current.onCreateSave();
    });

    await waitFor(() => {
      expect(api.updateBankAccount).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(api.updateBankAccount).mock.calls[0]?.[0]).toBe("acc-1");
    expect(vi.mocked(api.updateBankAccount).mock.calls[0]?.[1]).toMatchObject({
      name: "Nubank PJ",
      initialBalance: 15,
    });
  });
});
