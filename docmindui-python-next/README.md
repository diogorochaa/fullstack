# DocMind AI

> Assistente inteligente full-stack para conversar com documentos — upload de PDF, bases de conhecimento, RAG vetorial e chat em tempo real com streaming.

DocMind combina um backend Python orientado a agentes com uma interface Next.js moderna. O usuário faz upload de PDFs, organiza bases de conhecimento, conversa com a IA sobre o conteúdo indexado e acompanha, em tempo real, o raciocínio do agente enquanto a resposta é gerada token a token.

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | FastAPI · PostgreSQL · **PgVector** · LangGraph · LangChain · OpenAI · Celery · RabbitMQ · Redis · Socket.IO |
| **Frontend** | Next.js 16 · React 19 · TypeScript · TanStack Query · Zustand · Tailwind CSS v4 · shadcn/ui · Biome |

**Requisitos:** Python 3.11+ · Node.js 22+ · [uv](https://docs.astral.sh/uv/) · [pnpm](https://pnpm.io/) · Docker (recomendado para infra)

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Telas](#telas)
- [Arquitetura](#arquitetura)
- [Início rápido](#início-rápido)
- [Backend](#backend)
- [Frontend](#frontend)
- [Fluxo do chat](#fluxo-do-chat)
- [Qualidade e CI](#qualidade-e-ci)
- [Contribuindo](#contribuindo)

---

## Funcionalidades

### Autenticação e perfil

- Registro, login e sessão JWT
- Perfil do usuário em `/perfil` com preenchimento automático de endereço via CEP (ViaCEP)

### Bases de conhecimento

- CRUD de bases nomeadas (ex.: Financeiro, Jurídico)
- Upload de PDF por base, com extração de metadados via IA (título, palavras-chave, resumo)
- Indexação vetorial em **PgVector** (chunks + embeddings OpenAI)
- Reindexação e preview de PDFs na central de configurações

### Chat inteligente

- Orquestrador **LangGraph** com classificação de intenção:
  - `profile` — dados pessoais do usuário
  - `address` — endereço e CEP
  - `knowledge` / `rag` — documentos indexados
  - `general` — conversa livre
- Painel de atividade do agente (passos, base consultada, fontes)
- **Streaming** da resposta via Socket.IO (`ai:chunk`)
- Histórico persistido por usuário no PostgreSQL (anexos em JSON v2)

### Anexos multimídia (até 8 por mensagem, 8 MB cada)

| Tipo | Comportamento |
|------|----------------|
| **Imagens** (até 4) | Análise visual pela IA |
| **PDF** | Indexação + contexto na conversa |
| **Texto/código** (txt, md, csv, json…) | Trecho enviado no contexto |
| **Outros** (Office, zip, áudio, vídeo) | Metadados no contexto |

### Infraestrutura assíncrona

- Filas Celery (`documents`, `emails`, `default`) com RabbitMQ + Redis
- E-mails de boas-vindas e reset de senha processados em background
- UI responsiva: sidebar recolhível no desktop, sheet no mobile

---

## Telas

| Rota | Descrição |
|------|-----------|
| `/` | Chat principal — sidebar, anexos, streaming e painel do agente |
| `/configuracoes` | Bases de conhecimento, upload/gestão de PDFs e preview |
| `/perfil` | Dados pessoais e endereço |
| `/login` | Acesso |
| `/register` | Cadastro |

---

## Arquitetura

```mermaid
flowchart TB
  subgraph client [Frontend · Next.js]
    UI[Chat UI]
    REST[REST client]
    SIO[socket.io-client]
  end

  subgraph api [Backend · FastAPI]
    HTTP[Rotas REST]
    WS[Socket.IO]
    AG[LangGraph Orchestrator]
    TOOLS[Tools: perfil · documentos · RAG]
  end

  subgraph async [Workers · Celery]
    DOC[documents]
    MAIL[emails]
  end

  subgraph data [Dados]
    PG[(PostgreSQL + PgVector)]
    RMQ[(RabbitMQ)]
    RD[(Redis)]
  end

  UI --> REST --> HTTP
  UI --> SIO --> WS --> AG
  AG --> TOOLS
  TOOLS --> PG
  HTTP --> PG
  HTTP --> RMQ
  RMQ --> DOC --> PG
  RMQ --> MAIL
  DOC --> RD
  MAIL --> RD
```

### Estrutura do repositório

```
docmindui-python-next/
├── backend/
│   ├── src/
│   │   ├── main.py              # fastapi_app + asgi_app (Socket.IO)
│   │   ├── api/routes/          # auth, messages, documents, knowledge-bases, profile, agent
│   │   ├── agents/              # LangGraph, prompts, tools
│   │   ├── controllers/         # camada HTTP → serviços
│   │   ├── services/            # regras de negócio
│   │   ├── database/            # models, repositories, session
│   │   ├── rag/                 # embeddings, retriever, PDF loader
│   │   ├── realtime/            # Socket.IO (streaming + atividade)
│   │   └── workers/             # Celery + filas
│   ├── alembic/
│   ├── tests/
│   ├── docker-compose.yml
│   └── Makefile
├── frontend/
│   └── src/
│       ├── app/                 # rotas App Router
│       └── features/            # auth, chat, settings, knowledge-bases…
└── .github/workflows/           # CI backend + frontend
```

---

## Início rápido

### 1. Infraestrutura

**Opção A — Docker Compose completo** (PostgreSQL + Redis + RabbitMQ + API + worker):

```bash
cd backend
docker compose up -d
# API em http://localhost:8001
```

**Opção B — só filas/cache** (API local na porta `8000`):

```bash
cd backend
make infra-up          # Redis + RabbitMQ
docker compose up -d postgres   # ou use PostgreSQL local com extensão pgvector
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # OPENAI_API_KEY e SECRET_KEY são obrigatórios

make install
make migrate
make dev                # http://localhost:8000
```

> Use sempre `src.main:asgi_app`. Com `src.main:app` o Socket.IO retorna 404.

Worker Celery (terminal separado):

```bash
cd backend
uv run celery -A src.workers.celery_app worker -Q default,documents,emails --loglevel=info
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local

pnpm install
pnpm dev                # http://localhost:3000
```

### Portas e URLs

| Ambiente | API HTTP | Socket.IO | `NEXT_PUBLIC_API_URL` |
|----------|----------|-----------|------------------------|
| `make dev` | `http://localhost:8000` | mesma origem | `http://localhost:8000` |
| Docker Compose | `http://localhost:8001` | mesma origem | `http://localhost:8001` |

Documentação interativa (Swagger): `http://localhost:<porta>/docs`

RabbitMQ Management UI: http://localhost:15672 (`guest` / `guest`)

---

## Backend

### Filas Celery

| Fila | Tarefas |
|------|---------|
| `documents` | Indexação assíncrona de PDF |
| `emails` | Boas-vindas, reset de senha |
| `default` | Demais tarefas |

Roteamento em `src/workers/celery_app.py` · constantes em `src/workers/queues.py`.

### Endpoints REST

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check |
| **Auth** | | |
| `POST` | `/auth/register` | Cadastro |
| `POST` | `/auth/login` | Login (JWT) |
| `GET` | `/auth/me` | Perfil + mensagens |
| **Mensagens** | | |
| `GET` | `/messages/` | Histórico |
| `POST` | `/messages/` | Salvar mensagem |
| `DELETE` | `/messages/` | Limpar todo o histórico |
| `DELETE` | `/messages/conversations/{id}` | Excluir uma conversa |
| **Bases de conhecimento** | | |
| `GET` | `/knowledge-bases/` | Listar bases |
| `POST` | `/knowledge-bases/` | Criar base |
| `PATCH` | `/knowledge-bases/{id}` | Renomear base |
| `DELETE` | `/knowledge-bases/{id}` | Excluir base |
| **Documentos** | | |
| `POST` | `/documents/upload` | Upload de PDF (`?knowledge_base_id=`) |
| `GET` | `/documents/` | Listar documentos |
| `GET` | `/documents/{id}/file` | Download / preview do PDF |
| `POST` | `/documents/{id}/reindex` | Reindexar documento |
| `DELETE` | `/documents/{id}` | Excluir documento |
| **Perfil** | | |
| `GET` | `/profile/me` | Dados do perfil |
| `PUT` | `/profile/me` | Atualizar perfil |
| `GET` | `/profile/cep/{cep}` | Consulta ViaCEP |
| **Agente** | | |
| `POST` | `/agent/ask` | Resposta completa (sem streaming) |

### Socket.IO

Conectar com JWT: `auth: { token: "<access_token>" }` · path padrão: `/socket.io`

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `ai:ask` | cliente → servidor | Pergunta + anexos opcionais |
| `ai:activity` | servidor → cliente | Passos do agente (intenção, base, fontes) |
| `ai:chunk` | servidor → cliente | Token parcial (`delta`) |
| `ai:done` | servidor → cliente | Fim do streaming |
| `ai:error` | servidor → cliente | Erro |
| `connected` | servidor → cliente | Handshake OK |

Payload de `ai:ask`:

```json
{
  "question": "…",
  "conversation_id": "uuid-opcional",
  "knowledge_base_id": "uuid-opcional",
  "images": [{ "base64": "…", "media_type": "image/png" }],
  "attachment_context": "trecho de arquivos de texto…"
}
```

Contrato espelhado no frontend em `frontend/src/features/chat/api/socket-events.ts`.

### Variáveis de ambiente

Copie `backend/.env.example` → `backend/.env`:

```env
OPENAI_API_KEY=
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/docmind

CELERY_BROKER_URL=amqp://guest:guest@localhost:5672//
CELERY_RESULT_BACKEND=redis://localhost:6379/0
CELERY_INDEX_DOCUMENTS=false
DOCUMENTS_STORAGE_DIR=data/document_uploads

SOCKETIO_PATH=socket.io
SOCKETIO_CORS_ORIGINS=*

SECRET_KEY=change-me-in-production
```

### Comandos úteis

```bash
make install      # uv sync
make dev          # migrate + uvicorn asgi_app :8000
make test         # pytest
make typecheck    # mypy src
make check        # ruff + format check + pytest
make lint / fix / format
make migrate
make generate m="descricao da migration"
make infra-up     # Redis + RabbitMQ
make run          # logs da API no Docker
```

---

## Frontend

### Variáveis de ambiente

Copie `frontend/.env.example` → `frontend/.env.local`:

```env
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_PATH=/socket.io
```

`API_URL` — server actions / SSR · `NEXT_PUBLIC_*` — browser.

### Comandos

```bash
pnpm install
pnpm dev
pnpm run lint          # biome check .
pnpm run typecheck     # tsc --noEmit
pnpm run test          # vitest (API client)
pnpm run check         # biome check --write .
pnpm build
pnpm start
```

### Módulos principais

| Área | Caminho |
|------|---------|
| Chat + streaming | `src/features/chat/` |
| Auth (JWT) | `src/features/auth/` |
| Configurações / PDFs | `src/features/settings/` |
| Bases de conhecimento | `src/features/knowledge-bases/` |
| Anexos e limites | `src/features/chat/lib/attachments.ts` |
| Socket.IO | `src/features/chat/api/socket-events.ts` |

Detalhes adicionais: [frontend/README.md](./frontend/README.md)

---

## Fluxo do chat

```mermaid
sequenceDiagram
  participant U as Usuário
  participant FE as Frontend
  participant API as REST API
  participant WS as Socket.IO
  participant AG as LangGraph

  U->>FE: Mensagem + anexos opcionais
  FE->>API: POST /documents/upload (PDFs)
  FE->>API: POST /messages/ (persistir user)
  FE->>WS: ai:ask
  WS->>AG: classificar intenção + tools
  AG-->>WS: ai:activity (passos)
  AG-->>WS: ai:chunk (streaming)
  WS-->>FE: tokens em tempo real
  WS-->>FE: ai:done
  FE->>API: POST /messages/ (persistir assistant)
```

1. Usuário digita e, opcionalmente, anexa até 8 arquivos.
2. PDFs são enviados para indexação na base ativa.
3. Imagens e textos são preparados no cliente (`prepare-attachments.ts`).
4. Mensagem do usuário é salva via `POST /messages/`.
5. Pergunta vai por Socket.IO; tokens chegam em `ai:chunk` e a atividade em `ai:activity`.
6. Resposta final é persistida com `POST /messages/`.

---

## Qualidade e CI

Workflows em `.github/workflows/` disparam em push/PR quando `backend/**` ou `frontend/**` mudam.

| Projeto | Checks |
|---------|--------|
| **Backend** | `ruff check` · `ruff format --check` · `mypy src` · `pytest` |
| **Frontend** | `biome check` · `tsc --noEmit` · `vitest run` |

Localmente:

```bash
# Backend
cd backend && make check && make typecheck

# Frontend
cd frontend && pnpm run lint && pnpm run typecheck && pnpm run test
```

---

## Contribuindo

1. Commits focados com mensagens claras.
2. Rode os checks acima antes de abrir PR.
3. Atualize `.env.example` ao adicionar variáveis.
4. Preserve o contrato Socket.IO e os nomes das filas Celery documentados aqui.

---

## Licença

Projeto em desenvolvimento.
