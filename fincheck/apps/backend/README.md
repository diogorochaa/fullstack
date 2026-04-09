# Fincheck API (apps/backend)

API do Fincheck usando NestJS, Prisma e PostgreSQL.

## Requisitos

- Node.js >= 18
- pnpm 9
- PostgreSQL rodando (local via Docker ou externo)

## Setup

```bash
pnpm install
```

## Banco de dados local (Docker)

Na pasta `apps/backend`:

```bash
docker compose up -d
```

O compose sobe um PostgreSQL em `localhost:5432` com:

- user: `root`
- password: `root`

## Variaveis de ambiente

Defina ao menos:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (opcional)

Exemplo de `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://root:root@localhost:5432/fincheck?schema=public"
```

## Prisma

Gerar client:

```bash
pnpm exec prisma generate
```

Rodar migracoes em dev:

```bash
pnpm exec prisma migrate dev
```

## Scripts

```bash
# desenvolvimento
pnpm dev

# build
pnpm build

# start em producao (apos build)
pnpm start:prod

# lint
pnpm lint

# typecheck
pnpm check-types

# testes
pnpm test
pnpm test:watch
pnpm test:cov
pnpm test:e2e
```
