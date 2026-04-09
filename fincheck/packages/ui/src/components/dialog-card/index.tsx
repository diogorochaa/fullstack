import { X } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "../primitives/button";

type DialogCardProps = {
  title: string;
  actionLabel: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function DialogCard({
  title,
  actionLabel,
  onAction,
  actionDisabled,
  onClose,
  children,
}: DialogCardProps) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/20 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <span className="w-8" />
        </div>

        <div className="space-y-5">{children}</div>

        <Button
          className="mt-8"
          fullWidth
          onClick={onAction}
          disabled={actionDisabled}
        >
          <Button.Text>{actionLabel}</Button.Text>
        </Button>
      </div>
    </div>
  );
}
