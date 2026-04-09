import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

type ListItemProps = {
  title: string;
  category: string;
  amount: string;
  type: "income" | "expense";
};

export function ListItem({ title, category, amount, type }: ListItemProps) {
  const amountClass = type === "income" ? "text-emerald-600" : "text-rose-500";
  const signal = type === "income" ? "+" : "-";

  return (
    <article className="flex items-center justify-between rounded-[14px] border border-zinc-200 bg-white px-4 py-3">
      <div>
        <p className="text-emerald-600">
          {type === "income" ? (
            <ArrowUpRight size={20} />
          ) : (
            <ArrowDownLeft size={20} className="text-rose-500" />
          )}
        </p>
      </div>

      <div className="ml-3 flex-1">
        <p className="text-base font-semibold text-zinc-800">{title}</p>
        <p className="text-xs text-zinc-500">{category}</p>
      </div>

      <p className={["text-xl font-semibold", amountClass].join(" ")}>
        {signal} {amount}
      </p>
    </article>
  );
}
