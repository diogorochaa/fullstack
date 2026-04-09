import { Outlet } from "react-router";
import type { RootLayoutActions } from "./actions";

type RootLayoutViewProps = {
  ui: RootLayoutActions;
};

export function RootLayoutView({ ui }: RootLayoutViewProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-4 py-4 sm:px-6">
      <header className="mb-3 flex items-center justify-between rounded-[10px] bg-slate-100 px-3 py-2">
        <div className="inline-flex items-center gap-2 text-violet-700">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 text-[10px] font-semibold">
            □
          </span>
          <span className="text-xl font-medium tracking-tight">
            {ui.brandName}
          </span>
        </div>

        <div className="inline-flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
            {ui.initials}
          </div>

          <button
            type="button"
            onClick={ui.onSignOut}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </header>

      <section>
        <Outlet />
      </section>
    </main>
  );
}
