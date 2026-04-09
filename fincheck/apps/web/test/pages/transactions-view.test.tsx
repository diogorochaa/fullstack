import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TransactionsPageActions } from "../../src/pages/transactions/actions";
import { TransactionsPageView } from "../../src/pages/transactions/view";

vi.mock("@repo/ui", () => ({
  Shell: ({
    children,
    actions,
    onAccountCardClick,
  }: {
    children: React.ReactNode;
    actions: React.ReactNode;
    onAccountCardClick?: (cardId: string) => void;
  }) => (
    <div>
      <div data-testid="shell-actions">{actions}</div>
      <button onClick={() => onAccountCardClick?.("acc-1")}>
        edit-account
      </button>
      <div>{children}</div>
    </div>
  ),
  HangingMenu: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <button onClick={() => onSelect("income")}>menu</button>
  ),
  Tabs: ({ onChange }: { onChange?: (id: string) => void }) => (
    <button onClick={() => onChange?.("2026-4")}>tabs</button>
  ),
  FloatingMenu: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <button onClick={() => onSelect("new-expense")}>floating</button>
  ),
  DialogCard: ({
    title,
    actionLabel,
    onAction,
    children,
  }: {
    title: string;
    actionLabel: string;
    onAction?: () => void;
    children: React.ReactNode;
  }) => (
    <div>
      <h3>{title}</h3>
      <div>{children}</div>
      <button onClick={onAction}>{actionLabel}</button>
    </div>
  ),
  Input: Object.assign(
    ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
    {
      Label: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
      ),
      Field: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input {...props} />
      ),
      Helper: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
      ),
    },
  ),
  ListItem: ({ title }: { title: string }) => <div>{title}</div>,
}));

function createActions(
  overrides: Partial<TransactionsPageActions> = {},
): TransactionsPageActions {
  return {
    activeFilter: "all",
    activeMonthId: "2026-4",
    pageTitle: "Transações",
    filters: [{ id: "all", label: "Transações", tone: "neutral" }],
    filteredTransactions: [],
    accountCards: [],
    monthTabs: [{ id: "2026-4", label: "Abr" }],
    totalBalance: "R$ 0,00",
    isLoading: false,
    hasError: false,
    errorMessage: null,
    createOptions: [
      { id: "new-expense", label: "Nova Despesa", tone: "expense" },
    ],
    createCardType: null,
    createCardTitle: "Nova Despesa",
    createName: "",
    createAmount: "",
    createDate: "2026-04-10",
    createSelectedBankAccountId: "",
    createSelectedCategoryId: "",
    createSelectedCategoryType: "EXPENSE",
    createSelectedCategoryIcon: "tag",
    createBankAccountOptions: [],
    createCategoryOptions: [],
    createCategoryIconOptions: [{ id: "tag", label: "Etiqueta" }],
    createError: null,
    isCreateSubmitting: false,
    createActionLabel: "Salvar",
    deletingTransactionId: null,
    isFilterCardOpen: false,
    filterYear: new Date().getFullYear(),
    filterMonth: new Date().getMonth() + 1,
    draftFilterYear: new Date().getFullYear(),
    draftFilterMonth: new Date().getMonth() + 1,
    draftFilterPeriod: "2026-04",
    filterBankAccountId: "",
    draftFilterBankAccountId: "",
    filterBankAccountOptions: [{ id: "", label: "Todas as contas" }],
    activeFilterChips: [{ id: "year", label: "Ano: 2026" }],
    hasCustomFiltersApplied: false,
    hasDraftCustomFilters: false,
    setActiveFilter: vi.fn(),
    clearAllFilters: vi.fn(),
    clearDraftFilters: vi.fn(),
    removeFilterChip: vi.fn(),
    openFilterCard: vi.fn(),
    closeFilterCard: vi.fn(),
    applyFilters: vi.fn(),
    setDraftFilterPeriod: vi.fn(),
    setDraftFilterBankAccountId: vi.fn(),
    onEditAccount: vi.fn(),
    onDeleteTransaction: vi.fn(),
    onCreateOptionSelect: vi.fn(),
    closeCreateCard: vi.fn(),
    onCreateSave: vi.fn(),
    setCreateName: vi.fn(),
    setCreateAmount: vi.fn(),
    setCreateDate: vi.fn(),
    setCreateSelectedBankAccountId: vi.fn(),
    setCreateSelectedCategoryId: vi.fn(),
    setCreateSelectedCategoryType: vi.fn(),
    setCreateSelectedCategoryIcon: vi.fn(),
    setActiveMonthId: vi.fn(),
    ...overrides,
  };
}

describe("TransactionsPageView", () => {
  it("renders loading and empty states plus removable chips", () => {
    const actions = createActions({
      isLoading: true,
      hasCustomFiltersApplied: true,
    });

    render(<TransactionsPageView actions={actions} />);

    expect(screen.getByText("Carregando transações...")).toBeTruthy();
    expect(screen.getByText("Ano: 2026")).toBeTruthy();

    fireEvent.click(screen.getByText("Ano: 2026"));
    expect(actions.removeFilterChip).toHaveBeenCalledWith("year");

    fireEvent.click(screen.getByText("Limpar filtros"));
    expect(actions.clearAllFilters).toHaveBeenCalled();
  });

  it("renders filter and create dialogs and triggers actions", () => {
    const actions = createActions({
      isFilterCardOpen: true,
      hasDraftCustomFilters: true,
      createCardType: "new-expense",
      createName: "Mercado",
      createAmount: "50,00",
      createError: "erro de criacao",
      createBankAccountOptions: [{ id: "acc-1", label: "Nubank" }],
      createCategoryOptions: [{ id: "cat-1", label: "Mercado" }],
    });

    render(<TransactionsPageView actions={actions} />);

    fireEvent.click(screen.getByText("Limpar"));
    expect(actions.clearDraftFilters).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Aplicar Filtros"));
    expect(actions.applyFilters).toHaveBeenCalled();

    fireEvent.click(screen.getAllByText("Salvar")[0]);
    expect(actions.onCreateSave).toHaveBeenCalled();

    expect(screen.getByText("erro de criacao")).toBeTruthy();
  });

  it("renders transactions list and new-account modal branch", () => {
    const actions = createActions({
      filteredTransactions: [
        {
          id: "tr-1",
          title: "Salario",
          category: "Banco",
          amount: "R$ 1.000,00",
          type: "income",
          isDeleting: false,
        },
      ],
      createCardType: "new-account",
      createCardTitle: "Nova Conta",
      createName: "Conta nova",
      createAmount: "100,00",
    });

    render(<TransactionsPageView actions={actions} />);

    expect(screen.getByText("Salario")).toBeTruthy();
    expect(screen.getByText("Saldo inicial")).toBeTruthy();
    expect(screen.queryByText("Categoria")).toBeNull();
    expect(screen.queryByText("Data")).toBeNull();
  });

  it("renders category type selector for new-category modal branch", () => {
    const actions = createActions({
      createCardType: "new-category",
      createCardTitle: "Nova Categoria",
      createName: "Academia",
      createSelectedCategoryType: "EXPENSE",
      createSelectedCategoryIcon: "tag",
      createCategoryIconOptions: [
        { id: "tag", label: "Etiqueta" },
        { id: "wallet", label: "Carteira" },
      ],
    });

    render(<TransactionsPageView actions={actions} />);

    expect(screen.getByText("Tipo")).toBeTruthy();
    expect(screen.getByText("Ícone")).toBeTruthy();
    expect(screen.queryByText("Saldo inicial")).toBeNull();
    expect(screen.queryByText("Valor")).toBeNull();
    expect(screen.queryByText("Conta")).toBeNull();
    expect(screen.queryByText("Categoria")).toBeNull();
  });

  it("renders date field for new transaction modal branch", () => {
    const actions = createActions({
      createCardType: "new-expense",
      createCardTitle: "Nova Despesa",
      createDate: "2026-04-10",
      createBankAccountOptions: [{ id: "acc-1", label: "Nubank" }],
      createCategoryOptions: [{ id: "cat-1", label: "Mercado" }],
    });

    render(<TransactionsPageView actions={actions} />);

    expect(screen.getByText("Data")).toBeTruthy();
  });

  it("calls delete action from transaction row button", () => {
    const actions = createActions({
      filteredTransactions: [
        {
          id: "tr-1",
          title: "Mercado",
          category: "Alimentação",
          amount: "R$ 89,90",
          type: "expense",
          isDeleting: false,
        },
      ],
    });

    render(<TransactionsPageView actions={actions} />);

    fireEvent.click(screen.getByLabelText("Excluir transação"));
    expect(actions.onDeleteTransaction).toHaveBeenCalledWith("tr-1");
  });

  it("calls edit account action from shell card interaction", () => {
    const actions = createActions();

    render(<TransactionsPageView actions={actions} />);

    fireEvent.click(screen.getByText("edit-account"));
    expect(actions.onEditAccount).toHaveBeenCalledWith("acc-1");
  });
});
