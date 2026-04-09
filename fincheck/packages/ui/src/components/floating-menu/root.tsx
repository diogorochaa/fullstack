import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FloatingMenuItem } from "./item";
import type { FloatingMenuRootProps } from "./types";

export function FloatingMenuRoot({ options, onSelect }: FloatingMenuRootProps) {
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
    <div ref={containerRef} className="fixed bottom-5 right-5 z-30">
      {open ? (
        <div className="mb-3 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {options.map((option) => (
            <FloatingMenuItem
              key={option.id}
              option={option}
              onClick={(id) => {
                onSelect(id);
                setOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:bg-violet-700"
      >
        {open ? <X size={18} /> : <Plus size={18} />}
      </button>
    </div>
  );
}
