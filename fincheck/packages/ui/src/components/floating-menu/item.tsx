import { Building2, Minus, Plus } from "lucide-react";
import type { FloatingMenuOption } from "./types";

type FloatingMenuItemProps = {
  option: FloatingMenuOption;
  onClick: (id: string) => void;
};

function toneClass(tone: FloatingMenuOption["tone"]) {
  if (tone === "income") {
    return "bg-emerald-100 text-emerald-600";
  }

  if (tone === "expense") {
    return "bg-rose-100 text-rose-600";
  }

  return "bg-blue-100 text-blue-600";
}

export function FloatingMenuItem({ option, onClick }: FloatingMenuItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(option.id)}
      className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
    >
      <span
        className={[
          "inline-flex h-5 w-5 items-center justify-center rounded-full",
          toneClass(option.tone),
        ].join(" ")}
      >
        {option.tone === "income" ? (
          <Plus size={12} />
        ) : option.tone === "expense" ? (
          <Minus size={12} />
        ) : (
          <Building2 size={12} />
        )}
      </span>
      <span>{option.label}</span>
    </button>
  );
}
