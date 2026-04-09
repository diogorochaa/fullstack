import { Eye, EyeOff } from "lucide-react";
import type { ShellThemeClass } from "./theme";

type ShellBalanceSectionProps = {
  title: string;
  shownBalance: string;
  balanceHidden: boolean;
  onToggleBalance: () => void;
  themeClass: ShellThemeClass;
};

export function ShellBalanceSection({
  title,
  shownBalance,
  balanceHidden,
  onToggleBalance,
  themeClass,
}: ShellBalanceSectionProps) {
  return (
    <div>
      <p className={["text-sm", themeClass.subtitle].join(" ")}>Saldo total</p>

      <div className="mt-1 flex items-center gap-3">
        <p className="text-5xl font-semibold leading-none">{shownBalance}</p>
        <button
          type="button"
          onClick={onToggleBalance}
          className={[
            "inline-flex items-center justify-center rounded-md px-1 py-0.5 text-xl transition",
            themeClass.label,
          ].join(" ")}
          aria-label={balanceHidden ? "Mostrar saldo" : "Ocultar saldo"}
        >
          {balanceHidden ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      <p
        className={[
          "mt-10 text-xs uppercase tracking-[0.16em]",
          themeClass.label,
        ].join(" ")}
      >
        {title}
      </p>
    </div>
  );
}
