# Arquitetura — ecommerce-ia

Serviço de IA organizado em **camadas** com injeção de dependências e `Protocol` (Python 3.12).

## Camadas

```
presentation/     → HTTP (FastAPI), Socket.IO
application/      → casos de uso (orquestração)
domain/           → modelos + ports (contratos)
infrastructure/   → adapters (Chroma, OpenAI, httpx, Kafka, RabbitMQ)
container.py      → composition root (DI)
```

## Estrutura

```
src/ecommerce_ia/
├── main.py                 # create_app() + socket_app
├── container.py            # build_container(), get_container()
├── config/settings.py
├── domain/
│   ├── models.py           # ChatResult, AssistantReply, HealthSnapshot
│   └── ports/
│       ├── catalog.py      # CatalogReader (Protocol)
│       └── assistants.py   # ShoppingAssistant, AdminAnalyst
├── application/
│   ├── customer_chat.py    # CustomerChatUseCase
│   ├── admin_analysis.py   # AdminAnalysisUseCase
│   ├── catalog_sync.py     # CatalogSyncService
│   ├── faq_indexing.py     # FaqIndexingService
│   ├── health_status.py    # HealthStatusService
│   └── bootstrap.py        # startup/shutdown
├── infrastructure/
│   ├── http/ecommerce_api_client.py
│   ├── vector/chroma_store.py, chroma_retriever.py
│   ├── llm/langgraph_agent.py, admin_analyst.py, catalog_tools.py
│   └── messaging/consumers.py
└── presentation/
    ├── api/routes/chat.py, health.py
    └── socket/server.py
```

## Fluxo — chat do cliente

```
POST /chat
  → CustomerChatUseCase.execute()
    → LangGraphShoppingAssistant.run()
      → ChromaContextRetriever (RAG FAQ + catálogo)
      → LangGraph ReAct + catalog_tools (API ao vivo → fallback índice)
  → ChatResult
```

## Busca por imagem

O cliente pode enviar foto no chat (`POST /chat` com campo opcional `image`). O fluxo usa **visão** (`gpt-4o-mini`) para extrair termos, **busca automaticamente** o catálogo (`ImageCatalogMatcher`) e injeta os resultados na conversa antes da resposta final.

**Contrato:**

```json
{
  "message": "Vocês têm algo parecido?",
  "session_id": "abc",
  "image": {
    "data": "<base64>",
    "mime_type": "image/jpeg"
  }
}
```

- `message` ou `image` é obrigatório (mensagem padrão interna se só imagem)
- MIME aceitos: `image/jpeg`, `image/png`, `image/webp` (máx. 5 MB no servidor)
- Histórico Redis grava texto resumido (`[Foto enviada]`), não o base64
- Capability em `/status`: `image_search: true`
- Na UI, o cliente pode anexar arquivo ou colar print com Ctrl+V no chat

## Fluxo — chat admin

```
POST /chat/admin
  → AdminAnalysisUseCase.execute()
    → OpenAIAdminAnalyst.analyze()  (LLM direto + contexto JSON)
  → ChatResult
```

## Princípios aplicados

| Princípio | Implementação |
|-----------|-----------------|
| **SRP** | Cada use case / adapter com uma responsabilidade |
| **DIP** | Use cases dependem de `Protocol`, não de implementações |
| **DI** | `build_container()` monta o grafo; FastAPI `Depends(get_app_container)` |
| **Composition root** | `container.py` — único lugar que conhece todas as implementações |
| **Presentation fina** | Rotas só validam HTTP e delegam para use cases |

## Testabilidade

Testes injetam mocks via `patch("...get_app_container")` ou testam adapters isolados (`OpenAIAdminAnalyst` com factory mockada).

## Removido na refatoração

- Pacote monolítico `chat/` (RAG + LLM + socket misturados)
- `db/` sem modelos (Postgres não era usado)
- Publishers Kafka/RabbitMQ não utilizados
- Singletons globais (`ecommerce_api`, `consumers`, `_agent`)
