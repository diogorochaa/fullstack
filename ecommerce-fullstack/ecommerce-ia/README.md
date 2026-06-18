# ecommerce-ia

Serviço de IA do monorepo — assistente de compras e analista admin shopmax.

Stack: FastAPI, LangGraph, LangChain OpenAI, Chroma, Socket.IO.

Arquitetura em camadas: ver [`docs/IA-ARCHITECTURE.md`](../docs/IA-ARCHITECTURE.md).

## Setup

```bash
cp .env.example .env
# Configure OPENAI_API_KEY

make sync
make dev          # http://localhost:8100
make index        # indexa FAQ + catálogo (API deve estar rodando)
```

## Estrutura

```
src/ecommerce_ia/
├── domain/           # modelos + Protocol (ports)
├── application/      # casos de uso
├── infrastructure/   # Chroma, OpenAI, httpx, messaging
├── presentation/     # FastAPI + Socket.IO
└── container.py      # injeção de dependências
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check |
| `GET` | `/status` | Status + capabilities |
| `POST` | `/chat` | Assistente de compras |
| `POST` | `/chat/admin` | Analista admin |
| Socket.IO | `chat:message` | Chat em tempo real |

## Testes e qualidade

```bash
make check
make test
```

Documentação: [`docs/TESTING.md`](../docs/TESTING.md), [`docs/AUDIT.md`](../docs/AUDIT.md)
