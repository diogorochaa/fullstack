import { ListItem } from "@repo/ui";

export default {
  title: "UI/ListItem",
  component: ListItem,
  tags: ["autodocs"],
};

export const Income = {
  args: {
    title: "Salario",
    category: "04/06/2023",
    amount: "R$ 2.500,00",
    type: "income",
  },
};

export const Expense = {
  args: {
    title: "Mercado",
    category: "04/06/2023",
    amount: "R$ 230,00",
    type: "expense",
  },
};
