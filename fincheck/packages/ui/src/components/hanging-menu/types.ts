export type MenuOptionTone = "neutral" | "income" | "expense";

export type HangingMenuOption = {
  id: string;
  label: string;
  tone?: MenuOptionTone;
};

export type HangingMenuRootProps = {
  triggerLabel: string;
  options: HangingMenuOption[];
  selectedId: string;
  onSelect: (id: string) => void;
};
