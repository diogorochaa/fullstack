# Frontend — DocMind

Interface do DocMind: chat com streaming, bases de conhecimento, upload de PDFs e perfil do usuário.

**Stack:** Next.js 16 · React 19 · TypeScript · TanStack Query · Zustand · Tailwind CSS v4 · shadcn/ui · socket.io-client · Biome

---

## Pré-requisitos

- Node.js 22+
- [pnpm](https://pnpm.io/) — versão fixada em [`package.json`](./package.json) (`packageManager`)

---

## Setup

```bash
cp .env.example .env.local
pnpm install
pnpm dev          # http://localhost:3000
```

| Variável | Uso |
|----------|-----|
| `API_URL` | Server actions / SSR |
| `NEXT_PUBLIC_API_URL` | `fetch` no browser |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO (streaming da IA) |
| `NEXT_PUBLIC_SOCKET_PATH` | Path do Engine.IO (padrão `/socket.io`) |

Alinhe a porta com o backend: `8000` em `make dev`, `8001` no Docker Compose.

---

## Comandos

```bash
pnpm dev
pnpm run lint          # biome check .
pnpm run typecheck     # tsc --noEmit
pnpm run test          # vitest (API client)
pnpm run check         # biome check --write .
pnpm build
pnpm start
```

---

## Estrutura

```
src/
├── app/                         # Rotas App Router
│   ├── page.tsx                 # Chat (/)
│   ├── configuracoes/           # Bases + documentos
│   ├── perfil/                  # Perfil do usuário
│   ├── login/ · register/
├── features/
│   ├── auth/                    # Sessão JWT
│   ├── chat/                    # REST, Socket.IO, hooks, anexos
│   ├── settings/                # Modal e gestão de PDFs
│   └── knowledge-bases/         # API de bases de conhecimento
├── components/                  # UI compartilhada + shadcn
├── hooks/
└── stores/                      # Zustand (preferências, settings)
```

### Chat — anexos

- Até **8 arquivos** por mensagem · **8 MB** cada (`lib/attachments.ts`)
- Até **4 imagens** enviadas à visão da IA
- Componentes: `AttachmentPreviewGrid`, `AttachmentPreviewTile`, `AgentActivityPanel`

### Socket.IO

Eventos em `features/chat/api/socket-events.ts` — espelham o backend (`ai:ask`, `ai:activity`, `ai:chunk`, `ai:done`, `ai:error`).

---

## shadcn/ui

Configuração em [`components.json`](./components.json):

```bash
pnpm dlx shadcn@latest add <componente>
```
