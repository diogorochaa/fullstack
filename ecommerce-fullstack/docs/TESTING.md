# Testes — Shopmax

## Visão geral

| Projeto | Unitários | E2E | Linter |
|---------|-----------|-----|--------|
| **ecommerce-api** | Jest | Jest (smoke) | Biome |
| **ecommerce-ui** | Vitest | Playwright | Biome |
| **ecommerce-ia** | pytest | — | Ruff |

## Comandos

```bash
# API
cd ecommerce-api && npm run check && npm test

# UI
cd ecommerce-ui && npm run check && npm test && npm run test:e2e

# IA
cd ecommerce-ia && make check && make test
```

### E2E (Playwright)

Na primeira vez, instale o Chromium e as dependências do sistema:

```bash
cd ecommerce-ui
npm run test:e2e:install
sudo npx playwright install-deps chromium   # Linux/WSL
npm run test:e2e
```

Os testes de catálogo usam **mocks de API** (`e2e/fixtures/api-mocks.ts`) — não exigem a API rodando.

## Cobertura atual

### API (12 testes)

- `roles.guard.spec.ts` — guard ADMIN/CUSTOMER
- `admin.usecase.spec.ts` — stats, promover/revogar admin, deletar usuário
- `app.controller.spec.ts` — health

### IA (6 testes)

- `test_health.py`, `test_status.py`
- `test_chat.py`, `test_admin_chat.py`
- `test_admin_analyst.py`

### UI (7 unitários + 7 e2e)

**Unitários:** `format.test.ts`, `order-status.test.ts`, `App.test.tsx`

**E2E:**

- `app.spec.ts` — home, login
- `auth.spec.ts` — registro, redirect admin
- `catalog.spec.ts` — catálogo, paginação, promoções

## Credenciais de teste (seed)

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | `admin@shopmax.com` | `Admin@123` |
| Cliente | `maria@shopmax.com` | `Cliente@123` |

Rodar seed: `cd ecommerce-api && npm run prisma:seed`

Antes do seed, aplique as migrations pendentes se o banco estiver novo:

```bash
cd ecommerce-api && npx prisma migrate deploy
```

O chat da UI mostra preview de produto quando a IA retorna `sources` do tipo `product`.
