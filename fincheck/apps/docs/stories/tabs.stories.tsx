import { Tabs } from "@repo/ui";

export default {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export const Default = {
  args: {
    items: [
      { id: "jan", label: "Jan" },
      { id: "fev", label: "Fev" },
      { id: "mar", label: "Mar" },
    ],
    activeId: "fev",
  },
};
