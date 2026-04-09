import { Link } from "react-router";
import type { NotFoundPageActions } from "./actions";

type NotFoundPageViewProps = {
  ui: NotFoundPageActions;
};

export function NotFoundPageView({ ui }: NotFoundPageViewProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-zinc-900">{ui.title}</h2>
      <p className="text-zinc-600">{ui.description}</p>
      <Link
        to="/"
        className="inline-flex rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        {ui.ctaLabel}
      </Link>
    </div>
  );
}
