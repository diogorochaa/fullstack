const storybookUrl =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "http://localhost:6006";

export default function FrontendDocsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Frontend Docs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Storybook com os componentes exportados por @repo/ui.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            href={storybookUrl}
            target="_blank"
            rel="noreferrer"
          >
            Abrir Storybook em nova aba
          </a>
        </div>
      </header>

      <section className="mt-4 min-h-[72vh] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <iframe
          title="Fincheck Storybook"
          src={storybookUrl}
          className="h-[72vh] w-full"
        />
      </section>
    </main>
  );
}
