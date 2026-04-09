import { HangingMenu } from "@repo/ui";
import { useState } from "react";

export default {
  title: "UI/HangingMenu",
  component: HangingMenu,
  tags: ["autodocs"],
};

function HangingMenuPlayground() {
  const [selectedId, setSelectedId] = useState("all");

  return (
    <HangingMenu
      triggerLabel="Filtros"
      options={[
        { id: "income", label: "Receitas", tone: "income" },
        { id: "expense", label: "Despesas", tone: "expense" },
        { id: "all", label: "Transacoes", tone: "neutral" },
      ]}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  );
}

export const Default = {
  render: () => (
    <div className="min-h-56 p-10">
      <HangingMenuPlayground />
    </div>
  ),
};
