export type ShellTheme = "transactions" | "income" | "expense";

export type ShellThemeClass = {
  sidebar: string;
  subtitle: string;
  label: string;
};

export const shellThemeClasses: Record<ShellTheme, ShellThemeClass> = {
  transactions: {
    sidebar: "bg-violet-700 text-violet-50",
    subtitle: "text-violet-100",
    label: "text-violet-200",
  },
  income: {
    sidebar: "bg-violet-700 text-violet-50",
    subtitle: "text-violet-100",
    label: "text-violet-200",
  },
  expense: {
    sidebar: "bg-violet-800 text-violet-50",
    subtitle: "text-violet-100",
    label: "text-violet-200",
  },
};

export function wrapIndex(nextIndex: number, total: number) {
  return ((nextIndex % total) + total) % total;
}
