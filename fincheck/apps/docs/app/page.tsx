import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Fincheck Docs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Documentacao separada por dominio: backend com Swagger e frontend com
          Storybook.
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Backend</h2>
          <p className="mt-2 text-sm text-slate-600">
            Endpoints, schemas e autenticacao da API NestJS via Swagger.
          </p>
          <Link
            href="/backend"
            className="mt-4 inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Abrir docs do backend
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Frontend</h2>
          <p className="mt-2 text-sm text-slate-600">
            Catalogo completo dos componentes UI com Storybook.
          </p>
          <Link
            href="/frontend"
            className="mt-4 inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Abrir docs do frontend
          </Link>
        </article>
      </section>
    </main>
  );
}
