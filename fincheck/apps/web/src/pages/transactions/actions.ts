import { type FloatingMenuOption, type HangingMenuOption } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  formatCurrency,
  formatDate,
  formatMonthShortLabel,
} from "../../lib/formatters";
import {
  createBankAccount,
  createCategory,
  createTransaction,
  deleteTransaction,
  getBankAccounts,
  getCategories,
  getTransactions,
  updateBankAccount,
} from "../../services/api";
import { queryKeys } from "../../services/query-keys";

type TransactionType = "income" | "expense";
type ActiveFilter = "all" | "income" | "expense";

type TransactionItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  type: TransactionType;
  isDeleting: boolean;
};

type AccountCardItem = {
  id: string;
  name: string;
  balance: string;
  accentClassName: string;
};

type SelectOption = {
  id: string;
  label: string;
};

type ActiveFilterChip = {
  id: string;
  label: string;
};

type CategoryIcon = "tag" | "wallet" | "shopping-bag" | "home" | "car";

type CreateCardType =
  | "new-income"
  | "new-expense"
  | "new-account"
  | "new-category"
  | "edit-account";

const filters: HangingMenuOption[] = [
  { id: "income", label: "Receitas", tone: "income" },
  { id: "expense", label: "Despesas", tone: "expense" },
  { id: "all", label: "Transações", tone: "neutral" },
];

const createOptions: FloatingMenuOption[] = [
  { id: "new-expense", label: "Nova Despesa", tone: "expense" },
  { id: "new-income", label: "Nova Receita", tone: "income" },
  { id: "new-account", label: "Nova Conta", tone: "neutral" },
  { id: "new-category", label: "Nova Categoria", tone: "neutral" },
];

type MonthTab = {
  id: string;
  label: string;
  month: number;
  year: number;
};

function toMonthPeriodValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parseMonthPeriodValue(value: string) {
  const [rawYear, rawMonth] = value.split("-");
  const year = Number(rawYear);
  const month = Number(rawMonth);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function parseFilterFromSearchParams(
  searchParams: URLSearchParams,
  currentYear: number,
  currentMonth: number,
) {
  const filter = searchParams.get("filter");
  const period = searchParams.get("period") || "";
  const accountId = searchParams.get("accountId") || "";

  const parsedPeriod = parseMonthPeriodValue(period) ?? {
    year: currentYear,
    month: currentMonth,
  };

  const activeFilter: ActiveFilter =
    filter === "income" || filter === "expense" ? filter : "all";

  return {
    activeFilter,
    filterYear: parsedPeriod.year,
    filterMonth: parsedPeriod.month,
    filterBankAccountId: accountId,
  } as const;
}

function buildSearchParams(filters: {
  activeFilter: ActiveFilter;
  filterYear: number;
  filterMonth: number;
  filterBankAccountId: string;
}) {
  const params = new URLSearchParams();

  params.set(
    "period",
    toMonthPeriodValue(filters.filterYear, filters.filterMonth),
  );

  if (filters.activeFilter !== "all") {
    params.set("filter", filters.activeFilter);
  }

  if (filters.filterBankAccountId) {
    params.set("accountId", filters.filterBankAccountId);
  }

  return params;
}

function getRecentMonthTabs(): MonthTab[] {
  const now = new Date();
  return [0, -1].map((offset) => {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return {
      id: toMonthPeriodValue(year, month),
      label: formatMonthShortLabel(date),
      month,
      year,
    };
  });
}

function getCardAccentClass(color: string) {
  if (color.includes("f59e0b")) {
    return "bg-amber-500";
  }
  if (color.includes("0f172a")) {
    return "bg-slate-900";
  }
  if (color.includes("22c55e")) {
    return "bg-emerald-500";
  }
  return "bg-violet-500";
}

function parseAmountInput(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function formatAmountInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  return formatCurrency(Number(digitsOnly) / 100);
}

function getDefaultAccountColor() {
  return "#7c3aed";
}

export type TransactionsPageActions = {
  activeFilter: ActiveFilter;
  activeMonthId: string;
  pageTitle: string;
  filters: HangingMenuOption[];
  filteredTransactions: TransactionItem[];
  accountCards: AccountCardItem[];
  monthTabs: { id: string; label: string }[];
  totalBalance: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  createOptions: FloatingMenuOption[];
  createCardType: string | null;
  createCardTitle: string;
  createName: string;
  createAmount: string;
  createDate: string;
  createSelectedBankAccountId: string;
  createSelectedCategoryId: string;
  createSelectedCategoryType: "INCOME" | "EXPENSE";
  createSelectedCategoryIcon: CategoryIcon;
  createBankAccountOptions: SelectOption[];
  createCategoryOptions: SelectOption[];
  createCategoryIconOptions: SelectOption[];
  createError: string | null;
  isCreateSubmitting: boolean;
  createActionLabel: string;
  deletingTransactionId: string | null;
  isFilterCardOpen: boolean;
  filterYear: number;
  filterMonth: number;
  draftFilterYear: number;
  draftFilterMonth: number;
  draftFilterPeriod: string;
  filterBankAccountId: string;
  draftFilterBankAccountId: string;
  filterBankAccountOptions: SelectOption[];
  activeFilterChips: ActiveFilterChip[];
  hasCustomFiltersApplied: boolean;
  hasDraftCustomFilters: boolean;
  setActiveFilter: (id: string) => void;
  clearAllFilters: () => void;
  clearDraftFilters: () => void;
  removeFilterChip: (chipId: string) => void;
  openFilterCard: () => void;
  closeFilterCard: () => void;
  applyFilters: () => void;
  setDraftFilterPeriod: (value: string) => void;
  setDraftFilterBankAccountId: (value: string) => void;
  onEditAccount: (accountId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onCreateOptionSelect: (optionId: string) => void;
  closeCreateCard: () => void;
  onCreateSave: () => void;
  setCreateName: (value: string) => void;
  setCreateAmount: (value: string) => void;
  setCreateDate: (value: string) => void;
  setCreateSelectedBankAccountId: (value: string) => void;
  setCreateSelectedCategoryId: (value: string) => void;
  setCreateSelectedCategoryType: (value: "INCOME" | "EXPENSE") => void;
  setCreateSelectedCategoryIcon: (value: CategoryIcon) => void;
  setActiveMonthId: (id: string) => void;
};

export function useTransactionsPageActions(): TransactionsPageActions {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const initialFilters = useMemo(
    () => parseFilterFromSearchParams(searchParams, currentYear, currentMonth),
    [currentMonth, currentYear, searchParams],
  );
  const monthTabs = useMemo(() => getRecentMonthTabs(), []);
  const [activeMonthId, setActiveMonthId] = useState(
    toMonthPeriodValue(initialFilters.filterYear, initialFilters.filterMonth),
  );
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(
    initialFilters.activeFilter,
  );
  const [isFilterCardOpen, setFilterCardOpen] = useState(false);
  const [filterYear, setFilterYear] = useState(initialFilters.filterYear);
  const [filterMonth, setFilterMonth] = useState(initialFilters.filterMonth);
  const [draftFilterYear, setDraftFilterYear] = useState(
    initialFilters.filterYear,
  );
  const [draftFilterMonth, setDraftFilterMonth] = useState(
    initialFilters.filterMonth,
  );
  const [filterBankAccountId, setFilterBankAccountId] = useState(
    initialFilters.filterBankAccountId,
  );
  const [draftFilterBankAccountId, setDraftFilterBankAccountId] = useState(
    initialFilters.filterBankAccountId,
  );
  const [createCardType, setCreateCardType] = useState<CreateCardType | null>(
    null,
  );
  const [createName, setCreateName] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [createDate, setCreateDate] = useState(getTodayDateValue());
  const [createSelectedBankAccountId, setCreateSelectedBankAccountId] =
    useState("");
  const [createSelectedCategoryId, setCreateSelectedCategoryId] = useState("");
  const [createSelectedCategoryType, setCreateSelectedCategoryType] = useState<
    "INCOME" | "EXPENSE"
  >("EXPENSE");
  const [createSelectedCategoryIcon, setCreateSelectedCategoryIcon] =
    useState<CategoryIcon>("tag");
  const [createError, setCreateError] = useState<string | null>(null);

  const createCategoryIconOptions = useMemo<SelectOption[]>(
    () => [
      { id: "tag", label: "Etiqueta" },
      { id: "wallet", label: "Carteira" },
      { id: "shopping-bag", label: "Compras" },
      { id: "home", label: "Casa" },
      { id: "car", label: "Transporte" },
    ],
    [],
  );

  useEffect(() => {
    const nextParams = buildSearchParams({
      activeFilter,
      filterYear,
      filterMonth,
      filterBankAccountId,
    });

    if (nextParams.toString() === searchParams.toString()) {
      return;
    }

    navigate(
      {
        pathname: location.pathname,
        search: `?${nextParams.toString()}`,
      },
      { replace: true },
    );
  }, [
    activeFilter,
    filterBankAccountId,
    filterMonth,
    filterYear,
    location.pathname,
    navigate,
    searchParams,
  ]);

  useEffect(() => {
    const parsed = parseFilterFromSearchParams(
      searchParams,
      currentYear,
      currentMonth,
    );

    setActiveFilter(parsed.activeFilter);
    setFilterYear(parsed.filterYear);
    setFilterMonth(parsed.filterMonth);
    setDraftFilterYear(parsed.filterYear);
    setDraftFilterMonth(parsed.filterMonth);
    setFilterBankAccountId(parsed.filterBankAccountId);
    setDraftFilterBankAccountId(parsed.filterBankAccountId);
    setActiveMonthId(toMonthPeriodValue(parsed.filterYear, parsed.filterMonth));
  }, [currentMonth, currentYear, searchParams]);

  const bankAccountsQuery = useQuery({
    queryKey: queryKeys.bankAccounts,
    queryFn: getBankAccounts,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });

  const transactionTypeFilter =
    activeFilter === "income"
      ? "INCOME"
      : activeFilter === "expense"
        ? "EXPENSE"
        : undefined;

  const createTransactionType =
    createCardType === "new-income"
      ? "INCOME"
      : createCardType === "new-expense"
        ? "EXPENSE"
        : null;

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions({
      month: filterMonth,
      year: filterYear,
      bankAccountId: filterBankAccountId || undefined,
      type: transactionTypeFilter,
    }),
    queryFn: () =>
      getTransactions({
        month: filterMonth,
        year: filterYear,
        bankAccountId: filterBankAccountId || undefined,
        type: transactionTypeFilter,
      }),
  });

  const createBankAccountMutation = useMutation({
    mutationFn: createBankAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts });
      setCreateCardType(null);
      setCreateName("");
      setCreateAmount("");
      setCreateError(null);
    },
    onError: (error) => {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a conta.",
      );
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
      setCreateCardType(null);
      setCreateName("");
      setCreateAmount("");
      setCreateError(null);
    },
    onError: (error) => {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a transação.",
      );
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      setCreateCardType(null);
      setCreateName("");
      setCreateAmount("");
      setCreateError(null);
    },
    onError: (error) => {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a categoria.",
      );
    },
  });

  const updateBankAccountMutation = useMutation({
    mutationFn: ({
      bankAccountId,
      payload,
    }: {
      bankAccountId: string;
      payload: { name: string; initialBalance: number };
    }) => updateBankAccount(bankAccountId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts });
      setCreateCardType(null);
      setCreateName("");
      setCreateAmount("");
      setCreateError(null);
    },
    onError: (error) => {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a conta.",
      );
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
    },
  });

  const pageTitle =
    activeFilter === "income"
      ? "Receitas"
      : activeFilter === "expense"
        ? "Despesas"
        : "Transações";

  const createCardTitle =
    createCardType === "new-income"
      ? "Nova Receita"
      : createCardType === "new-expense"
        ? "Nova Despesa"
        : createCardType === "new-account"
          ? "Nova Conta"
          : createCardType === "edit-account"
            ? "Editar Conta"
            : "Nova Categoria";

  const isCreateSubmitting =
    createBankAccountMutation.isPending ||
    createTransactionMutation.isPending ||
    createCategoryMutation.isPending ||
    updateBankAccountMutation.isPending;

  const createActionLabel = isCreateSubmitting ? "Salvando..." : "Salvar";

  const filterBankAccountOptions = useMemo<SelectOption[]>(() => {
    return [
      { id: "", label: "Todas as contas" },
      ...(bankAccountsQuery.data ?? []).map((account) => ({
        id: account.id,
        label: account.name,
      })),
    ];
  }, [bankAccountsQuery.data]);

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    const selectedAccount = filterBankAccountOptions.find(
      (option) => option.id === filterBankAccountId,
    );

    chips.push({
      id: "account",
      label: `Conta: ${selectedAccount?.label ?? "Todas"}`,
    });

    const monthLabel = formatMonthShortLabel(
      new Date(filterYear, filterMonth - 1, 1),
    );

    chips.push({
      id: "period",
      label: `Período: ${monthLabel}/${filterYear}`,
    });

    if (activeFilter !== "all") {
      chips.push({
        id: "type",
        label: activeFilter === "income" ? "Tipo: Receitas" : "Tipo: Despesas",
      });
    }

    return chips;
  }, [
    activeFilter,
    filterBankAccountId,
    filterBankAccountOptions,
    filterMonth,
    filterYear,
  ]);

  const hasCustomFiltersApplied =
    activeFilter !== "all" ||
    filterBankAccountId !== "" ||
    filterYear !== currentYear ||
    filterMonth !== currentMonth;

  const hasDraftCustomFilters =
    draftFilterBankAccountId !== "" ||
    draftFilterYear !== currentYear ||
    draftFilterMonth !== currentMonth;

  const createBankAccountOptions = useMemo<SelectOption[]>(() => {
    return (bankAccountsQuery.data ?? []).map((account) => ({
      id: account.id,
      label: account.name,
    }));
  }, [bankAccountsQuery.data]);

  const createCategoryOptions = useMemo<SelectOption[]>(() => {
    const categories = categoriesQuery.data ?? [];

    return categories
      .filter((category) => {
        if (!createTransactionType) {
          return true;
        }

        return category.type === createTransactionType;
      })
      .map((category) => ({
        id: category.id,
        label: category.name,
      }));
  }, [categoriesQuery.data, createTransactionType]);

  useEffect(() => {
    if (!createTransactionType) {
      return;
    }

    if (!createSelectedBankAccountId && createBankAccountOptions.length > 0) {
      setCreateSelectedBankAccountId(createBankAccountOptions[0]?.id ?? "");
    }
  }, [
    createBankAccountOptions,
    createSelectedBankAccountId,
    createTransactionType,
  ]);

  useEffect(() => {
    if (!createTransactionType) {
      return;
    }

    const hasSelectedCategory = createCategoryOptions.some(
      (option) => option.id === createSelectedCategoryId,
    );

    if (!hasSelectedCategory) {
      setCreateSelectedCategoryId(createCategoryOptions[0]?.id ?? "");
    }
  }, [createCategoryOptions, createSelectedCategoryId, createTransactionType]);

  const accountCards = useMemo<AccountCardItem[]>(() => {
    return (bankAccountsQuery.data ?? []).map((account) => ({
      id: account.id,
      name: account.name,
      balance: formatCurrency(account.currentBalance),
      accentClassName: getCardAccentClass(account.color.toLowerCase()),
    }));
  }, [bankAccountsQuery.data]);

  const totalBalance = useMemo(() => {
    const value = (bankAccountsQuery.data ?? []).reduce(
      (acc, account) => acc + account.currentBalance,
      0,
    );

    return formatCurrency(value);
  }, [bankAccountsQuery.data]);

  const categoryById = useMemo(() => {
    return new Map((categoriesQuery.data ?? []).map((item) => [item.id, item]));
  }, [categoriesQuery.data]);

  const filteredTransactions = useMemo<TransactionItem[]>(() => {
    return (transactionsQuery.data ?? []).map((item) => ({
      id: item.id,
      title: item.name,
      category: item.categoryId
        ? (categoryById.get(item.categoryId)?.name ?? formatDate(item.date))
        : formatDate(item.date),
      amount: formatCurrency(item.value),
      type: item.type === "INCOME" ? "income" : "expense",
      isDeleting:
        deleteTransactionMutation.isPending &&
        deleteTransactionMutation.variables === item.id,
    }));
  }, [
    categoryById,
    deleteTransactionMutation.isPending,
    deleteTransactionMutation.variables,
    transactionsQuery.data,
  ]);

  const errorMessage =
    (bankAccountsQuery.error instanceof Error &&
      bankAccountsQuery.error.message) ||
    (categoriesQuery.error instanceof Error && categoriesQuery.error.message) ||
    (transactionsQuery.error instanceof Error &&
      transactionsQuery.error.message) ||
    null;

  const isLoading =
    bankAccountsQuery.isLoading ||
    categoriesQuery.isLoading ||
    transactionsQuery.isLoading;

  const hasError =
    bankAccountsQuery.isError ||
    categoriesQuery.isError ||
    transactionsQuery.isError;

  function resetCreateState() {
    setCreateCardType(null);
    setCreateName("");
    setCreateAmount("");
    setCreateDate(getTodayDateValue());
    setCreateSelectedBankAccountId("");
    setCreateSelectedCategoryId("");
    setCreateSelectedCategoryType("EXPENSE");
    setCreateSelectedCategoryIcon("tag");
    setCreateError(null);
  }

  function openFilterCard() {
    setDraftFilterYear(filterYear);
    setDraftFilterMonth(filterMonth);
    setDraftFilterBankAccountId(filterBankAccountId);
    setFilterCardOpen(true);
  }

  function closeFilterCard() {
    setFilterCardOpen(false);
  }

  function applyFilters() {
    setFilterYear(draftFilterYear);
    setFilterMonth(draftFilterMonth);
    setFilterBankAccountId(draftFilterBankAccountId);
    setActiveMonthId(toMonthPeriodValue(draftFilterYear, draftFilterMonth));
    setFilterCardOpen(false);
  }

  function clearAllFilters() {
    setActiveFilter("all");
    setFilterYear(currentYear);
    setFilterMonth(currentMonth);
    setDraftFilterYear(currentYear);
    setDraftFilterMonth(currentMonth);
    setFilterBankAccountId("");
    setDraftFilterBankAccountId("");
  }

  function clearDraftFilters() {
    setDraftFilterYear(currentYear);
    setDraftFilterMonth(currentMonth);
    setDraftFilterBankAccountId("");
  }

  function removeFilterChip(chipId: string) {
    if (chipId === "type") {
      setActiveFilter("all");
      return;
    }

    if (chipId === "account") {
      setFilterBankAccountId("");
      setDraftFilterBankAccountId("");
      return;
    }

    if (chipId === "period") {
      setFilterYear(currentYear);
      setFilterMonth(currentMonth);
      setDraftFilterYear(currentYear);
      setDraftFilterMonth(currentMonth);
    }
  }

  function onCreateSave() {
    const trimmedName = createName.trim();

    if (!createCardType) {
      return;
    }

    if (!trimmedName) {
      setCreateError("Informe um nome.");
      return;
    }

    if (createCardType === "new-category") {
      setCreateError(null);
      void createCategoryMutation.mutateAsync({
        name: trimmedName,
        type: createSelectedCategoryType,
        icon: createSelectedCategoryIcon,
      });
      return;
    }

    const parsedAmount = parseAmountInput(createAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setCreateError("Informe um valor válido maior que zero.");
      return;
    }

    if (createCardType === "new-account") {
      setCreateError(null);
      void createBankAccountMutation.mutateAsync({
        name: trimmedName,
        initialBalance: parsedAmount,
        type: "CHECKING",
        color: getDefaultAccountColor(),
      });
      return;
    }

    if (!createDate) {
      setCreateError("Informe a data da transação.");
      return;
    }

    if (createCardType === "edit-account") {
      if (!createSelectedBankAccountId) {
        setCreateError("Selecione uma conta para editar.");
        return;
      }

      setCreateError(null);
      void updateBankAccountMutation.mutateAsync({
        bankAccountId: createSelectedBankAccountId,
        payload: {
          name: trimmedName,
          initialBalance: parsedAmount,
        },
      });
      return;
    }

    if (!createSelectedBankAccountId) {
      setCreateError("Crie uma conta antes de registrar transações.");
      return;
    }

    if (!createSelectedCategoryId) {
      setCreateError("Nenhuma categoria disponível para criar a transação.");
      return;
    }

    const transactionType =
      createCardType === "new-income" ? "INCOME" : "EXPENSE";

    setCreateError(null);
    void createTransactionMutation.mutateAsync({
      bankAccountId: createSelectedBankAccountId,
      categoryId: createSelectedCategoryId,
      name: trimmedName,
      value: parsedAmount,
      date: new Date(`${createDate}T00:00:00.000Z`).toISOString(),
      type: transactionType,
    });
  }

  return {
    activeFilter,
    activeMonthId,
    pageTitle,
    filters,
    filteredTransactions,
    accountCards,
    monthTabs: monthTabs.map(({ id, label }) => ({ id, label })),
    totalBalance,
    isLoading,
    hasError,
    errorMessage,
    createOptions,
    createCardType,
    createCardTitle,
    createName,
    createAmount,
    createDate,
    createSelectedBankAccountId,
    createSelectedCategoryId,
    createSelectedCategoryType,
    createSelectedCategoryIcon,
    createBankAccountOptions,
    createCategoryOptions,
    createCategoryIconOptions,
    createError,
    isCreateSubmitting,
    createActionLabel,
    deletingTransactionId:
      deleteTransactionMutation.isPending &&
      typeof deleteTransactionMutation.variables === "string"
        ? deleteTransactionMutation.variables
        : null,
    isFilterCardOpen,
    filterYear,
    filterMonth,
    draftFilterYear,
    draftFilterMonth,
    draftFilterPeriod: toMonthPeriodValue(draftFilterYear, draftFilterMonth),
    filterBankAccountId,
    draftFilterBankAccountId,
    filterBankAccountOptions,
    activeFilterChips,
    hasCustomFiltersApplied,
    hasDraftCustomFilters,
    setActiveFilter: (id: string) => {
      setActiveFilter(id as ActiveFilter);
    },
    clearAllFilters,
    clearDraftFilters,
    removeFilterChip,
    openFilterCard,
    closeFilterCard,
    applyFilters,
    setDraftFilterPeriod: (value) => {
      const parsed = parseMonthPeriodValue(value);

      if (!parsed) {
        return;
      }

      setDraftFilterYear(parsed.year);
      setDraftFilterMonth(parsed.month);
    },
    setDraftFilterBankAccountId,
    onEditAccount: (accountId) => {
      const account = (bankAccountsQuery.data ?? []).find(
        (item) => item.id === accountId,
      );

      if (!account) {
        return;
      }

      setCreateCardType("edit-account");
      setCreateSelectedBankAccountId(account.id);
      setCreateName(account.name);
      setCreateAmount(formatCurrency(account.initialBalance));
      setCreateError(null);
    },
    onDeleteTransaction: (transactionId) => {
      if (deleteTransactionMutation.isPending) {
        return;
      }

      void deleteTransactionMutation.mutateAsync(transactionId);
    },
    onCreateOptionSelect: (optionId) => {
      const option = optionId as CreateCardType;
      setCreateCardType(option);
      setCreateName("");
      setCreateAmount("");
      setCreateSelectedBankAccountId("");
      setCreateSelectedCategoryId("");
      setCreateSelectedCategoryType(
        activeFilter === "income" ? "INCOME" : "EXPENSE",
      );
      setCreateSelectedCategoryIcon("tag");
      setCreateError(null);
    },
    closeCreateCard: resetCreateState,
    onCreateSave,
    setCreateName,
    setCreateAmount: (value) => setCreateAmount(formatAmountInput(value)),
    setCreateDate,
    setCreateSelectedBankAccountId,
    setCreateSelectedCategoryId,
    setCreateSelectedCategoryType,
    setCreateSelectedCategoryIcon,
    setActiveMonthId: (id) => {
      const tab = monthTabs.find((item) => item.id === id);

      if (!tab) {
        return;
      }

      setActiveMonthId(id);
      setFilterYear(tab.year);
      setFilterMonth(tab.month);
      setDraftFilterYear(tab.year);
      setDraftFilterMonth(tab.month);
    },
  };
}
