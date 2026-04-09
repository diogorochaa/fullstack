import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HangingMenuItem } from "./item";
import type { HangingMenuRootProps } from "./types";

export function HangingMenuRoot({
  triggerLabel,
  options,
  selectedId,
  onSelect,
}: HangingMenuRootProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <span>{triggerLabel}</span>
        <ChevronDown
          size={16}
          className={[
            "text-slate-400 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {options.map((option) => (
            <HangingMenuItem
              key={option.id}
              option={option}
              selected={option.id === selectedId}
              onClick={(id) => {
                onSelect(id);
                setOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
