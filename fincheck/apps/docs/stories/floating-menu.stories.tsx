import { FloatingMenu } from "@repo/ui";

export default {
  title: "UI/FloatingMenu",
  component: FloatingMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export const Default = {
  render: () => (
    <div className="relative min-h-screen bg-slate-50 p-4">
      <FloatingMenu
        options={[
          { id: "new-expense", label: "Nova Despesa", tone: "expense" },
          { id: "new-income", label: "Nova Receita", tone: "income" },
          { id: "new-account", label: "Nova Conta", tone: "neutral" },
        ]}
        onSelect={() => {}}
      />
    </div>
  ),
};
