/** Garante URL da API estável antes de importar módulos que leem `process.env` no topo. */
process.env.API_URL = "http://api.test"
delete process.env.NEXT_PUBLIC_API_URL
