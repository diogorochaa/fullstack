const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export default function BackendDocsPage() {
  const swaggerUiUrl = `${backendUrl}/docs`;
  const openApiJsonUrl = `${backendUrl}/docs/json`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Backend Docs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Swagger gerado automaticamente a partir dos controllers e DTOs da API.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            href={swaggerUiUrl}
            target="_blank"
            rel="noreferrer"
          >
            Abrir Swagger em nova aba
          </a>
          <a
            className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            href={openApiJsonUrl}
            target="_blank"
            rel="noreferrer"
          >
            Abrir OpenAPI JSON
          </a>
        </div>
      </header>

      <section className="mt-4 min-h-[72vh] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <iframe
          title="Fincheck Swagger"
          src={swaggerUiUrl}
          className="h-[72vh] w-full"
        />
      </section>
    </main>
  );
}
