import { Equal, Minus, Plus } from "lucide-react";
import type { HangingMenuOption, MenuOptionTone } from "./types";

type HangingMenuItemProps = {
  option: HangingMenuOption;
  selected: boolean;
  onClick: (id: string) => void;
};

function toneClass(tone: MenuOptionTone) {
  if (tone === "income") {
    return "bg-emerald-100 text-emerald-600";
  }

  if (tone === "expense") {
    return "bg-rose-100 text-rose-600";
  }

  return "bg-indigo-100 text-indigo-600";
}

export function HangingMenuItem({
  option,
  selected,
  onClick,
}: HangingMenuItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(option.id)}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm",
        selected
          ? "bg-violet-50 text-violet-700"
          : "text-slate-600 hover:bg-slate-50",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
          toneClass(option.tone ?? "neutral"),
        ].join(" ")}
      >
        {option.tone === "income" ? (
          <Plus size={12} />
        ) : option.tone === "expense" ? (
          <Minus size={12} />
        ) : (
          <Equal size={12} />
        )}
      </span>
      <span>{option.label}</span>
    </button>
  );
}
