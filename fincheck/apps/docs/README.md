# Fincheck Docs (apps/docs)

Aplicacao Next.js para documentacao e Storybook dos componentes do projeto.

## Scripts

```bash
# docs (next)
pnpm dev

# build docs (next)
pnpm build

# lint
pnpm lint

# typecheck
pnpm check-types
```

## Storybook

```bash
# storybook em desenvolvimento
pnpm storybook

# build estatico do storybook
pnpm build-storybook
```

## Testes de componentes (Storybook)

```bash
# roda os testes contra um Storybook ja rodando em :6006
pnpm storybook:test

# fluxo CI: sobe Storybook e executa os testes automaticamente
pnpm storybook:test:ci
```

Esses testes sao executados no pipeline principal (`.github/workflows/ci-cd.yml`) antes do build/deploy do Storybook.
