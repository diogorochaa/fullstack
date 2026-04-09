import {
  DialogCard,
  FloatingMenu,
  HangingMenu,
  Input,
  ListItem,
  Shell,
  Tabs,
} from "@repo/ui";
import type { TransactionsPageActions } from "./actions";

type TransactionsPageViewProps = {
  actions: TransactionsPageActions;
};

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M3 5h18l-7 8v5l-4 2v-7L3 5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        d="M4 7h16M10 11v6M14 11v6M9 4h6l1 2H8l1-2zm-3 3l1 12h10l1-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="36"
        strokeDashoffset="10"
      />
    </svg>
  );
}

export function TransactionsPageView({ actions }: TransactionsPageViewProps) {
  const isTransactionCreation =
    actions.createCardType === "new-income" ||
    actions.createCardType === "new-expense";
  const isCategoryCreation = actions.createCardType === "new-category";

  return (
    <>
      <Shell
        title="Saldo total"
        balance={actions.totalBalance}
        accountCards={actions.accountCards}
        onAccountCardClick={actions.onEditAccount}
        actions={
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <HangingMenu
                triggerLabel={actions.pageTitle}
                options={actions.filters}
                selectedId={actions.activeFilter}
                onSelect={actions.setActiveFilter}
              />
            </div>

            <div className="flex items-center gap-2">
              <Tabs
                items={actions.monthTabs}
                activeId={actions.activeMonthId}
                onChange={actions.setActiveMonthId}
              />

              <button
                type="button"
                onClick={actions.openFilterCard}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 hover:text-slate-700 active:scale-95"
                aria-label="Abrir filtros"
                title="Abrir filtros"
              >
                <FilterIcon />
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {actions.activeFilterChips.map((chip) => (
              <button
                type="button"
                key={chip.id}
                onClick={() => actions.removeFilterChip(chip.id)}
                className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 active:scale-95"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{chip.label}</span>
                  <CloseIcon />
                </span>
              </button>
            ))}

            {actions.hasCustomFiltersApplied ? (
              <button
                type="button"
                onClick={actions.clearAllFilters}
                className="cursor-pointer rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 active:scale-95"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>

          {actions.isLoading ? (
            <p className="animate-pulse rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
              Carregando transações...
            </p>
          ) : null}

          {actions.hasError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actions.errorMessage ??
                "Não foi possível carregar as transações."}
            </p>
          ) : null}

          {!actions.isLoading &&
          !actions.hasError &&
          actions.filteredTransactions.length === 0 ? (
            <p className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
              Nenhuma transação encontrada para o período selecionado.
            </p>
          ) : null}

          {!actions.isLoading &&
          !actions.hasError &&
          actions.filteredTransactions.length > 0
            ? actions.filteredTransactions.map((item) => (
                <div
                  key={`${item.title}-${item.amount}-${item.category}`}
                  className={[
                    "group flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5",
                    item.isDeleting
                      ? "scale-[0.98] opacity-55 blur-[0.5px]"
                      : "opacity-100",
                  ].join(" ")}
                >
                  <div className="flex-1">
                    <ListItem
                      title={item.title}
                      category={item.category}
                      amount={item.amount}
                      type={item.type}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => actions.onDeleteTransaction(item.id)}
                    disabled={item.isDeleting}
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 opacity-0 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Excluir transação"
                    title="Excluir transação"
                  >
                    {item.isDeleting ? <LoadingIcon /> : <TrashIcon />}
                  </button>
                </div>
              ))
            : null}
        </div>
      </Shell>

      <FloatingMenu
        options={actions.createOptions}
        onSelect={actions.onCreateOptionSelect}
      />

      {actions.isFilterCardOpen ? (
        <DialogCard
          title="Filtros"
          actionLabel="Aplicar Filtros"
          onAction={actions.applyFilters}
          onClose={actions.closeFilterCard}
        >
          {actions.hasDraftCustomFilters ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={actions.clearDraftFilters}
                className="cursor-pointer rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 active:scale-95"
              >
                Limpar
              </button>
            </div>
          ) : null}

          <Input>
            <Input.Label>Conta</Input.Label>
            <select
              className="fc-input cursor-pointer transition-colors duration-200 hover:border-slate-300"
              value={actions.draftFilterBankAccountId}
              onChange={(event) =>
                actions.setDraftFilterBankAccountId(event.target.value)
              }
            >
              {actions.filterBankAccountOptions.map((option) => (
                <option key={option.id || "all"} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </Input>

          <div className="space-y-2">
            <Input>
              <Input.Label>Período</Input.Label>
              <Input.Field
                type="month"
                value={actions.draftFilterPeriod}
                onChange={(event) =>
                  actions.setDraftFilterPeriod(event.target.value)
                }
              />
            </Input>
          </div>
        </DialogCard>
      ) : null}

      {actions.createCardType ? (
        <DialogCard
          title={actions.createCardTitle}
          actionLabel={actions.createActionLabel}
          onAction={actions.onCreateSave}
          actionDisabled={actions.isCreateSubmitting}
          onClose={actions.closeCreateCard}
        >
          <Input>
            <Input.Label>Nome</Input.Label>
            <Input.Field
              type="text"
              placeholder="Digite um nome"
              value={actions.createName}
              onChange={(event) => actions.setCreateName(event.target.value)}
            />
          </Input>

          {isCategoryCreation ? null : (
            <Input>
              <Input.Label>
                {actions.createCardType === "new-account" ||
                actions.createCardType === "edit-account"
                  ? "Saldo inicial"
                  : "Valor"}
              </Input.Label>
              <Input.Field
                type="text"
                placeholder="R$ 0,00"
                value={actions.createAmount}
                onChange={(event) =>
                  actions.setCreateAmount(event.target.value)
                }
              />
            </Input>
          )}

          {isCategoryCreation ? (
            <>
              <Input>
                <Input.Label>Tipo</Input.Label>
                <select
                  className="fc-input cursor-pointer transition-colors duration-200 hover:border-slate-300"
                  value={actions.createSelectedCategoryType}
                  onChange={(event) =>
                    actions.setCreateSelectedCategoryType(
                      event.target.value as "INCOME" | "EXPENSE",
                    )
                  }
                >
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </select>
              </Input>

              <Input>
                <Input.Label>Ícone</Input.Label>
                <select
                  className="fc-input cursor-pointer transition-colors duration-200 hover:border-slate-300"
                  value={actions.createSelectedCategoryIcon}
                  onChange={(event) =>
                    actions.setCreateSelectedCategoryIcon(
                      event.target.value as
                        | "tag"
                        | "wallet"
                        | "shopping-bag"
                        | "home"
                        | "car",
                    )
                  }
                >
                  {actions.createCategoryIconOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Input>
            </>
          ) : null}

          {isTransactionCreation ? (
            <>
              <Input>
                <Input.Label>Data</Input.Label>
                <Input.Field
                  type="date"
                  value={actions.createDate}
                  onChange={(event) =>
                    actions.setCreateDate(event.target.value)
                  }
                />
              </Input>

              <Input>
                <Input.Label>Conta</Input.Label>
                <select
                  className="fc-input cursor-pointer transition-colors duration-200 hover:border-slate-300"
                  value={actions.createSelectedBankAccountId}
                  onChange={(event) =>
                    actions.setCreateSelectedBankAccountId(event.target.value)
                  }
                >
                  <option value="">Selecione uma conta</option>
                  {actions.createBankAccountOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Input>

              <Input>
                <Input.Label>Categoria</Input.Label>
                <select
                  className="fc-input cursor-pointer transition-colors duration-200 hover:border-slate-300"
                  value={actions.createSelectedCategoryId}
                  onChange={(event) =>
                    actions.setCreateSelectedCategoryId(event.target.value)
                  }
                >
                  <option value="">Selecione uma categoria</option>
                  {actions.createCategoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Input>
            </>
          ) : null}

          {actions.createError ? (
            <Input.Helper className="text-red-600">
              {actions.createError}
            </Input.Helper>
          ) : null}
        </DialogCard>
      ) : null}
    </>
  );
}
