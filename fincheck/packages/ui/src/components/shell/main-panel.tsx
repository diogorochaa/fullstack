import { type ReactNode } from "react";

type ShellMainPanelProps = {
  actions?: ReactNode;
  children: ReactNode;
};

export function ShellMainPanel({ actions, children }: ShellMainPanelProps) {
  return (
    <div className="flex min-h-full flex-col bg-slate-50 p-4 sm:p-5">
      <header className="mb-3 flex items-center justify-between gap-3">
        {actions}
      </header>
      <div className="min-h-80 flex-1 rounded-[14px] border border-slate-200 bg-slate-50 p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
}
