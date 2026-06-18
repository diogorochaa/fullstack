# Ecommerce Fullstack — Shopmax

Monorepo de ecommerce com catálogo, autenticação, pedidos, pagamentos, assistente de IA e arquitetura orientada a eventos. O frontend consome a API NestJS; o serviço de IA consulta o catálogo via HTTP e reage a mudanças de produto via Kafka e RabbitMQ.

## Visão geral

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **ecommerce-ui** | `5173` | Loja shopmax (React) — home, catálogo, auth, chat IA |
| **ecommerce-api** | `3000` | API REST + WebSocket — domínio, persistência, eventos |
| **ecommerce-ia** | `8100` | Assistente de compras — LangGraph, RAG, tools do catálogo |

**Infraestrutura (Docker Compose):** PostgreSQL, Redis, RabbitMQ, Kafka + Zookeeper, Kafka UI (`:8080`).

**Observabilidade (opcional):** Prometheus (`:9090`), Grafana (`:3030`), Loki — ver [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md). Subir com `./scripts/observability-up.sh`.

Diagrama completo das integrações: [`docs/PROJECT-UTILITIES.excalidraw`](docs/PROJECT-UTILITIES.excalidraw) (abra em [excalidraw.com](https://excalidraw.com)).

## Arquitetura

```mermaid
flowchart TB
  subgraph client [Cliente]
    UI[ecommerce-ui]
  end

  subgraph backend [Backend]
    API[ecommerce-api]
    IA[ecommerce-ia]
  end

  subgraph infra [Infraestrutura]
    PG[(PostgreSQL)]
    Redis[(Redis)]
    Kafka[[Kafka]]
    Rabbit[[RabbitMQ]]
  end

  UI -->|REST JWT| API
  UI -->|REST chat| IA
  UI -->|Socket.IO /events| API

  API --> PG
  IA --> PG
  IA -->|httpx read-only| API

  API -->|emit| Kafka
  API -->|publish| Rabbit
  Kafka -->|product.*| IA
  Rabbit -->|ia.reindex| IA

  API --> Redis
  IA --> Redis
```

### Princípios

- **API como fonte de verdade** — catálogo, pedidos, pagamentos e usuários vivem no NestJS + Prisma.
- **Clean Architecture na API** — módulos com `domain → application → infrastructure → presentation`.
- **Eventos desacoplados** — Kafka para log de domínio; RabbitMQ para jobs assíncronos; Socket.IO para tempo real no UI.
- **IA consultiva** — o assistente não altera dados; usa tools HTTP e RAG (FAQ + catálogo indexado no Chroma).

---

## Stack técnica

### ecommerce-api

| Camada | Tecnologia |
|--------|------------|
| Framework | NestJS 11, TypeScript |
| ORM | Prisma 6 + PostgreSQL 16 |
| Auth | JWT (access + refresh com rotação), Passport |
| Validação HTTP | class-validator + ValidationPipe global |
| Validação env | Zod (`config/env.ts`) |
| Docs | Swagger em `/api/docs` (somente dev) |
| Mensageria | KafkaJS (producer), amqplib (pub + consumer) |
| Real-time | Socket.IO namespace `/events` |
| Qualidade | Biome, Jest |

**Módulos:** `auth`, `users`, `categories`, `products`, `cart`, `addresses`, `orders`, `payments`, `admin`.

### ecommerce-ui

| Camada | Tecnologia |
|--------|------------|
| Build | Vite 6, React 19, TypeScript |
| Estilo | Tailwind CSS v4, shadcn/ui, tema shopmax (laranja `#FF5C00`) |
| Estado servidor | TanStack Query |
| Estado cliente | Zustand (auth persistido em `localStorage`) |
| Formulários | React Hook Form + Zod |
| Animações | Framer Motion |
| Real-time | socket.io-client → `/events` |
| Testes | Vitest, Playwright |
| Qualidade | Biome |

**Rotas públicas:** `/`, `/produtos`, `/login`, `/register`, `/products/:id`.

**Rotas admin:** `/admin/dashboard`, `/admin/produtos`, `/admin/usuarios`, `/admin/pedidos`, `/admin/assistente`.

### ecommerce-ia

| Camada | Tecnologia |
|--------|------------|
| Framework | FastAPI, uvicorn |
| Orquestração | LangGraph (agente ReAct com tools) |
| LLM | OpenAI `gpt-4o-mini` via LangChain |
| RAG | Chroma (FAQ markdown + catálogo de produtos) |
| Integração API | httpx (produtos e categorias) |
| Mensageria | aiokafka (consumer), aio-pika (consumer) |
| Chat | REST `POST /chat` + Socket.IO `chat:message` |
| Qualidade | Ruff, pytest |

---

## Estrutura do repositório

```
ecommerce-fullstack/
├── docker-compose.yml      # Postgres, Redis, RabbitMQ, Kafka, ecommerce-ia
├── docs/
│   ├── AUDIT.md              # auditoria e pendências
│   ├── TESTING.md            # guia de testes
│   └── PROJECT-UTILITIES.excalidraw
├── ecommerce-api/          # NestJS + Prisma
│   ├── prisma/schema.prisma
│   └── src/modules/        # domínios (auth, products, orders, …)
├── ecommerce-ui/           # React shopmax
│   └── src/
│       ├── app/            # router, providers
│       ├── features/       # auth, home, products, assistant
│       ├── services/       # HTTP clients (api, ia)
│       └── stores/         # Zustand
└── ecommerce-ia/           # FastAPI + LangGraph (camadas: domain → app → infra)
    ├── data/faq/           # documentos RAG estáticos
    └── src/ecommerce_ia/   # ver docs/IA-ARCHITECTURE.md
```

---

## Pré-requisitos

- **Node.js 22** (ver `.nvmrc`)
- **Docker** e **Docker Compose**
- **Python 3.12+** e **uv** (para `ecommerce-ia` local)
- **OpenAI API Key** (assistente de IA)

---

## Como rodar (desenvolvimento)

### 1. Infraestrutura

```bash
docker compose up -d
```

Sobe: PostgreSQL `:5432`, Redis `:6379`, RabbitMQ `:5672` (UI `:15672`), Kafka `:9092` (UI `:8080`), Zookeeper `:2181`, e opcionalmente `ecommerce-ia` em container.

### 2. API

```bash
cd ecommerce-api
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

- API: http://localhost:3000  
- Swagger: http://localhost:3000/api/docs  

### 3. Frontend

```bash
cd ecommerce-ui
cp .env.example .env
npm install
npm run dev
```

- UI: http://localhost:5173  

### 4. IA (local, recomendado para dev)

```bash
cd ecommerce-ia
cp .env.example .env
# Preencha OPENAI_API_KEY no .env

make sync
make dev          # http://localhost:8100
make index        # indexa FAQ + catálogo (API deve estar no ar)
```

> Se a API roda no host e a IA no Docker, o compose já aponta `ECOMMERCE_API_URL` para `host.docker.internal:3000`.

### Ordem sugerida

```
docker compose up -d  →  API  →  UI  →  IA (+ make index)
```

---

## Variáveis de ambiente

### ecommerce-api (`.env`)

| Variável | Exemplo | Uso |
|----------|---------|-----|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/ecommerce` | Prisma |
| `JWT_SECRET` | string segura | Assinatura dos tokens |
| `JWT_EXPIRES_IN` | `1d` | Access token |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token |
| `KAFKA_BROKERS` | `localhost:9092` | Eventos de domínio |
| `RABBITMQ_URL` | `amqp://rabbit:rabbit@localhost:5672` | Filas assíncronas |
| `REDIS_URL` | `redis://localhost:6379` | Reservado (sessões IA) |
| `CORS_ORIGINS` | `http://localhost:5173` | Origens permitidas (vírgula) |
| `PAYMENT_WEBHOOK_SECRET` | string | Segredo do header `x-webhook-secret` |
| `THROTTLE_LOGIN_LIMIT` | `5` | Tentativas de login por minuto |

### ecommerce-ui (`.env`)

| Variável | Exemplo |
|----------|---------|
| `VITE_API_URL` | `http://localhost:3000` |
| `VITE_IA_API_URL` | `http://localhost:8100` |
| `VITE_SOCKET_URL` | `http://localhost:3000` |

### ecommerce-ia (`.env`)

| Variável | Exemplo |
|----------|---------|
| `ECOMMERCE_API_URL` | `http://localhost:3000` |
| `OPENAI_API_KEY` | `sk-…` |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `CHROMA_PERSIST_DIR` | `.chroma` |
| `JWT_SECRET` | Mesmo valor da API | Auth em `/chat/admin` |
| `REDIS_URL` | `redis://localhost:6379` | Histórico multi-turn do chat |
| `KAFKA_BROKERS` | `localhost:9092` |
| `RABBITMQ_URL` | `amqp://rabbit:rabbit@localhost:5672` |

---

## API — endpoints principais

| Módulo | Rotas | Auth |
|--------|-------|------|
| Auth | `POST /auth/register`, `/login`, `/refresh` | Público |
| Users | `GET /users/me`, `PATCH /users/me` | JWT |
| Categories | `GET /categories`, `GET /categories/:id` | Público |
| Products | `GET /products`, `GET /products/:id` | Público |
| Products | `POST/PATCH/DELETE /products` | JWT + ADMIN |
| Cart | `GET /cart`, `POST /cart/items`, … | JWT |
| Addresses | `GET/POST /addresses`, … | JWT |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id` | JWT |
| Payments | `POST /payments`, `POST /payments/webhook` | JWT / webhook |
| Admin | `GET /admin/stats`, `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `GET /admin/users`, `PATCH /admin/users/:id/role`, `DELETE /admin/users/:id` | JWT + ADMIN |

Paginação padrão: `?page=1&limit=10`. Produtos aceitam `?search=&categoryId=`.

---

## Eventos e mensageria

A API publica eventos via `DomainEventsService` após operações de domínio. Falhas de broker **não interrompem** a requisição HTTP.

### Kafka (tópicos)

| Tópico | Quando |
|--------|--------|
| `product.created` / `updated` / `deleted` | CRUD de produto (admin) |
| `order.created` | Novo pedido |
| `order.status.changed` | Admin altera status |
| `payment.paid` / `payment.failed` | Pagamento confirmado ou falhou |

### RabbitMQ (filas)

| Fila | Produtor | Consumidor |
|------|----------|------------|
| `ia.reindex` | API (produtos) | ecommerce-ia → Chroma |
| `orders.fulfillment` | API (pedidos) | API → log + Socket `order:fulfillment` |
| `payments.webhook` | API (webhook) | API → auditoria assíncrona |

### Socket.IO (`/events`)

| Evento | Descrição |
|--------|-----------|
| `order:created` | Pedido criado (toast no UI) |
| `order:status` | Status alterado pelo admin |
| `order:fulfillment` | Preparação de envio |
| `payment:updated` | Pagamento atualizado |

O UI escuta esses eventos via `useOrderEvents` quando o usuário está autenticado.

---

## IA — assistente shopmax

- **REST:** `POST /chat` com `{ "message": "…", "session_id": "opcional" }`
- **Socket:** `chat:message` → `chat:reply`
- **Tools:** busca de produtos, detalhe por ID, listagem de categorias (via API)
- **RAG:** FAQ em `ecommerce-ia/data/faq/` + catálogo no Chroma
- **Sincronização:** consumers Kafka/Rabbit reindexam produtos automaticamente após mudanças na API

Widget flutuante no layout (`ChatWidget`) no canto inferior direito.

---

## Testes e qualidade

```bash
# API
cd ecommerce-api && npm run check && npm test

# UI
cd ecommerce-ui && npm run check && npm test && npm run test:e2e

# IA
cd ecommerce-ia && make check && make test
```

Guia completo: [`docs/TESTING.md`](docs/TESTING.md). Auditoria e pendências: [`docs/AUDIT.md`](docs/AUDIT.md).

## Scripts úteis

```bash
# API
cd ecommerce-api && npm run start:dev
cd ecommerce-api && npm run prisma:seed
cd ecommerce-api && npm run prisma:studio

# UI
cd ecommerce-ui && npm run dev
cd ecommerce-ui && npm run build
cd ecommerce-ui && npm run test:e2e:install   # primeira vez

# IA
cd ecommerce-ia && make dev
cd ecommerce-ia && make index

# Infra
docker compose up -d
```

### Credenciais demo (seed)

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | `admin@shopmax.com` | `Admin@123` |
| Cliente | `maria@shopmax.com` | `Cliente@123` |

---

## Modelo de dados (resumo)

Entidades Prisma: `User`, `Category`, `Product`, `Cart`, `CartItem`, `Address`, `Order`, `OrderItem`, `Payment`.

Enums: `Role` (CUSTOMER, ADMIN), `OrderStatus` (PENDING → PAID → SHIPPED → DELIVERED / CANCELLED), `PaymentStatus` (PENDING, PAID, FAILED).

---

## O que está pronto vs. pendente

### Implementado

- Catálogo público (`/produtos`) + CRUD admin de produtos e categorias
- Auth JWT com refresh, role revalidada no banco, `/users/me`
- Carrinho, endereços, pedidos e pagamento simulado com webhook idempotente
- Painel admin completo (dashboard, gráficos, CRUD produtos, usuários, pedidos, IA admin)
- Frontend shopmax (home, catálogo paginado, detalhe, login/register, chat IA)
- Assistente IA com LLM, tools, RAG, `/chat/admin` e reindexação por eventos
- Kafka + RabbitMQ + Kafka UI + Socket.IO integrados
- Seed com 32 produtos, 15 pedidos e usuários demo
- Testes: unitários (API, IA, UI) + e2e Playwright (7 cenários)
- Linters: Biome (API/UI), Ruff (IA)

### Próximas fases

- Checkout funcional no frontend
- Histórico de chat multi-turn no Redis
- Auth no `/chat/admin` e rate limiting
- CI/CD e API no Docker Compose
- Ver lista completa em [`docs/AUDIT.md`](docs/AUDIT.md)

---

## Licença

Projeto privado — uso interno DFR.
