import { HangingMenu, ListItem, Shell, Tabs } from "@repo/ui";
import { useState } from "react";

const accountCards = [
  {
    id: "nubank",
    name: "Nubank",
    balance: "R$ 123,00",
    accentClassName: "bg-violet-500",
  },
  {
    id: "xp",
    name: "XP Investimentos",
    balance: "R$ 123,00",
    accentClassName: "bg-slate-800",
  },
  {
    id: "cash",
    name: "Carteira",
    balance: "R$ 89,00",
    accentClassName: "bg-amber-500",
  },
];

export default {
  title: "UI/Shell",
  component: Shell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

function ShellPlayground() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="p-4">
      <Shell
        title="Saldo total"
        balance="R$ 100,00"
        accountCards={accountCards}
        actions={
          <div className="flex w-full items-center justify-between gap-2">
            <HangingMenu
              triggerLabel="Transacoes"
              options={[
                { id: "income", label: "Receitas", tone: "income" },
                { id: "expense", label: "Despesas", tone: "expense" },
                { id: "all", label: "Transacoes", tone: "neutral" },
              ]}
              selectedId={activeFilter}
              onSelect={setActiveFilter}
            />
            <Tabs
              items={[
                { id: "mai", label: "Mai" },
                { id: "jun", label: "Jun" },
              ]}
              activeId="mai"
            />
          </div>
        }
      >
        <div className="space-y-2.5">
          <ListItem
            title="Salario"
            category="04/06/2023"
            amount="R$ 2.500,00"
            type="income"
          />
          <ListItem
            title="Cinema"
            category="04/06/2023"
            amount="R$ 123,00"
            type="expense"
          />
        </div>
      </Shell>
    </div>
  );
}

export const Default = {
  render: () => <ShellPlayground />,
};
