type TabItem = {
  id: string;
  label: string;
};

type TabsProps = {
  items: TabItem[];
  activeId: string;
  onChange?: (id: string) => void;
};

export function Tabs({ items, activeId, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1">
      {items.map((item) => {
        const active = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange?.(item.id)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium",
              active ? "bg-white text-violet-700 shadow-sm" : "text-slate-500",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
