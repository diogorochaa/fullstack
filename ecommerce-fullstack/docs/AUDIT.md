# Auditoria e melhorias — Shopmax

Registro das correções aplicadas e pendências conhecidas (última revisão: jun/2026).

## Corrigido nesta revisão

### API

- **Estoque:** decremento atômico com `updateMany` + verificação `stock >= quantity` na criação de pedidos
- **JWT:** role revalidada no banco a cada request autenticado
- **Webhook de pagamento:** header opcional `x-webhook-secret` (`PAYMENT_WEBHOOK_SECRET`)
- **Erros internos:** mensagem genérica ao cliente; detalhes só no log
- **CORS:** configurável via `CORS_ORIGINS` (HTTP e Socket.IO alinhados)
- **Eventos de pagamento:** payload inclui `userId` para filtro no frontend
- **Linter:** Biome sem erros

### UI

- **Login:** respeita redirect `state.from` após autenticação
- **Logout:** limpa cache do React Query (evita vazamento entre sessões)
- **Header:** campo de busca sincronizado com a URL
- **Paginação:** `aria-label` na próxima página
- **HTML:** `lang="pt-BR"` e título Shopmax
- **Chat IA:** preview de produto a partir de `sources` com link e compra rápida
- **Admin produtos:** sheet mais largo e formulário responsivo para edição/criação
- **IA admin:** validação Zod da resposta
- **Linter:** Biome sem erros

### IA

- **Arquitetura:** refatoração em camadas (`domain` → `application` → `infrastructure` → `presentation`) com DI via `container.py` — ver [`IA-ARCHITECTURE.md`](IA-ARCHITECTURE.md)
- **Reindex:** paginação completa do catálogo (>100 produtos)
- **Docker:** volume persistente `ecommerce_ia_chroma` para Chroma
- **Socket:** handler `disconnect` sem chamada recursiva
- **Input:** `max_length` em mensagens de chat
- **Script `index_catalog`:** reutiliza helper de paginação
- **Linter:** Ruff sem erros

## Implementado (jun/2026 — melhorias pendentes)

- Transição de status de pedido com regras (`PENDING→PAID|CANCELLED`, etc.) + restauração de estoque ao cancelar
- Rate limiting em `POST /auth/login` (`@nestjs/throttler`, 5 req/min padrão)
- Auth JWT em `POST /chat/admin` (mesmo `JWT_SECRET` da API)
- Busca de produtos no menu mobile (sheet lateral)
- Code-splitting das rotas admin (`React.lazy` + `Suspense`)
- Histórico multi-turn de chat no Redis (`chat:session:{id}`, TTL 24h)

## Pendências (próximas fases)

| Prioridade | Área | Item |
|------------|------|------|
| Alta | API | Pagamento simulado em transação única |
| Média | API | Consumer RabbitMQ `payments.webhook` deve processar o use case |
| Baixa | UI | Padronizar URLs `/produtos/:id` vs `/products/:id` |
| Baixa | UI | Favoritos por ID (evitar dados stale no localStorage) |

## Segurança — notas para produção

- Definir `PAYMENT_WEBHOOK_SECRET` em todos os ambientes
- `JWT_SECRET` com pelo menos 32 caracteres
- Não expor `ecommerce-ia` publicamente sem auth no chat admin
- Preferir cookies httpOnly para tokens (hoje: localStorage)
