# Fincheck

Monorepo do Fincheck com frontend web, backend API e documentacao de componentes com Storybook.

## Estrutura

- `apps/backend`: API NestJS + Prisma + PostgreSQL
- `apps/web`: frontend React + Vite
- `apps/docs`: documentacao e Storybook
- `packages/ui`: biblioteca de componentes compartilhados
- `packages/eslint-config`: configuracoes ESLint compartilhadas
- `packages/typescript-config`: configuracoes TypeScript compartilhadas

## Requisitos

- Node.js >= 18
- pnpm 9 (definido em `packageManager`)

## Setup

```bash
pnpm install
```

## Scripts da raiz

```bash
# sobe todos os apps em modo dev via turbo
pnpm dev

# lint de todo o monorepo
pnpm lint

# typecheck de todo o monorepo
pnpm check-types

# build de todo o monorepo
pnpm build
```

## Executar por app

```bash
# backend
pnpm --filter api dev

# web
pnpm --filter web dev

# docs (next)
pnpm --filter docs dev

# storybook
pnpm --filter docs storybook
```

## CI/CD

Workflow principal: `.github/workflows/ci-cd.yml`

Em push para `main`, o pipeline executa:

1. CI: install, generate prisma client, lint, typecheck, testes backend e build
2. CD: empacota artifacts de release
3. Storybook (condicional): roda testes de componentes, build e deploy no GitHub Pages

O job de Storybook roda quando:

- ha mudancas em `apps/docs`, `packages/ui`, lockfile/workspace, ou no proprio workflow
- ou quando o workflow e disparado manualmente (`workflow_dispatch`)
