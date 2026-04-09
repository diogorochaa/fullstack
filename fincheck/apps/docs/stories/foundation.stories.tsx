export default {
  title: "Foundation/Tokens",
  tags: ["autodocs"],
};

const colors = [
  { name: "Primary", value: "var(--fc-primary)" },
  { name: "Primary Hover", value: "var(--fc-primary-hover)" },
  { name: "Background", value: "var(--fc-background)" },
  { name: "Card", value: "var(--fc-card)" },
  { name: "Border", value: "var(--fc-border)" },
  { name: "Text", value: "var(--fc-text)" },
  { name: "Text Muted", value: "var(--fc-text-muted)" },
  { name: "Success", value: "var(--fc-success)" },
  { name: "Danger", value: "var(--fc-danger)" },
  { name: "Warning", value: "var(--fc-warning)" },
  { name: "Info", value: "var(--fc-info)" },
];

export const Colors = {
  render: () => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {colors.map((item) => (
        <div
          key={item.name}
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div
            className="h-16 rounded-md border border-slate-200"
            style={{ background: item.value }}
          />
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {item.name}
          </p>
          <p className="text-xs text-slate-500">{item.value}</p>
        </div>
      ))}
    </div>
  ),
};

export const Typography = {
  render: () => (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Display Font
        </p>
        <p className="sb-display-font mt-1 text-3xl">Space Grotesk</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Base Font
        </p>
        <p className="mt-1 text-base">
          Inter - The quick brown fox jumps over the lazy dog.
        </p>
      </div>

      <div className="space-y-1">
        <p className="sb-display-font text-2xl font-semibold">Heading 2</p>
        <p className="text-lg font-medium">Heading 4</p>
        <p className="text-base">Body text default</p>
        <p className="text-sm text-slate-500">Caption / helper text</p>
      </div>
    </div>
  ),
};
