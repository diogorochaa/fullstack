export type FloatingMenuOption = {
  id: string;
  label: string;
  tone: "income" | "expense" | "neutral";
};

export type FloatingMenuRootProps = {
  options: FloatingMenuOption[];
  onSelect: (optionId: string) => void;
};
