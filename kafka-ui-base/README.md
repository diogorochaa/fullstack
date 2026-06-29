# Kafka Learning Lab

Projeto didatico para aprender Apache Kafka na pratica com Node.js, TypeScript, Fastify, KafkaJS, PostgreSQL, Prisma, Docker Compose, Kafka UI e uma pagina Next.js chamada Kafka Playground.

O objetivo e enxergar o fluxo completo de eventos:

```text
Cliente
  -> API Fastify
  -> PostgreSQL
  -> Producer Kafka
  -> topic orders.created
  -> Kafka
  -> worker-email
  -> worker-stock
  -> worker-analytics
  -> Kafka Playground + Kafka UI
```

## Stack

- Node.js e TypeScript em modo strict.
- Fastify para a API.
- KafkaJS para producer e consumers.
- Apache Kafka em modo KRaft, sem ZooKeeper.
- Kafka UI da Provectus em `http://localhost:8080`.
- PostgreSQL com Prisma.
- Next.js para o Kafka Playground.

## Estrutura

```text
apps/
  api/
  playground/
  worker-email/
  worker-stock/
  worker-analytics/

packages/
  kafka/
  shared/
```

Cada app tem seu proprio `package.json` e pode rodar em um processo separado. O root usa npm workspaces apenas para facilitar instalacao e scripts.

## Como Rodar

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env`:

```bash
cp .env.example .env
```

3. Suba Kafka, Kafka UI e PostgreSQL:

```bash
docker compose up
```

O Docker Compose sobe:

- Kafka em KRaft.
- Kafka UI em `http://localhost:8080`.
- PostgreSQL em `localhost:5432`.
- Um container `kafka-init` que cria os topicos `orders.created` e `orders.created.dlq`.

4. Gere o Prisma Client e rode a migration:

```bash
npm run db:generate
npm run db:migrate
```

5. Em terminais separados, rode:

```bash
npm run dev:api
npm run dev:email
npm run dev:stock
npm run dev:analytics
npm run dev:playground
```

Abra:

- API: `http://localhost:3333`
- Playground: `http://localhost:3000`
- Kafka UI: `http://localhost:8080`

## Criando Um Pedido

Via HTTP:

```bash
curl -X POST http://localhost:3333/orders \
  -H "Content-Type: application/json" \
  -d '{"customerEmail":"cliente@example.com","productSku":"BOOK-KAFKA","quantity":1}'
```

Via navegador, abra `http://localhost:3000` e use o formulario.

Quando o pedido e criado, a API:

1. Salva o pedido no PostgreSQL.
2. Registra a etapa `ORDER_CREATED`.
3. Publica o evento `orders.created`.
4. Registra `EVENT_PUBLISHED` com topico, particao, offset e timestamp.

Depois disso, tres consumers independentes processam o mesmo evento:

- `worker-email`: simula envio de email com delay de 2 segundos.
- `worker-stock`: simula baixa no estoque com delay de 1 segundo.
- `worker-analytics`: atualiza metricas com delay de 500 ms.

## Conceitos Kafka Usando Este Projeto

### O Que E Kafka

Kafka e uma plataforma de streaming de eventos. Neste projeto, a API nao chama email, estoque e analytics diretamente. Ela publica um evento em Kafka dizendo: "um pedido foi criado". Os workers decidem o que fazer com esse evento.

Isso reduz acoplamento. A API conhece o topico `orders.created`, mas nao precisa conhecer os consumidores.

### Producer

Producer e quem publica mensagens no Kafka. Aqui, a API usa `KafkaProducer` de `packages/kafka`.

Exemplo real do projeto:

```ts
await producer.publish({
  topic: "orders.created",
  key: order.id,
  value: event
});
```

### Consumer

Consumer e quem le mensagens de um topico. Os apps `worker-email`, `worker-stock` e `worker-analytics` sao consumers.

Cada um herda de `BaseConsumer`, que centraliza:

- conexao com Kafka;
- leitura da mensagem;
- retry;
- DLQ;
- idempotencia;
- metadados de topico, particao, offset e timestamp.

### Topic

Topic e uma categoria de eventos. Este laboratorio usa:

- `orders.created`: eventos de pedidos criados.
- `orders.created.dlq`: mensagens que falharam apos retries.

### Partition

Partition e uma divisao interna do topico. O topico `orders.created` nasce com 4 partitions no `docker-compose.yml`.

Isso permite paralelismo: diferentes consumers do mesmo consumer group podem processar partitions diferentes.

Para aumentar para 8 partitions:

```bash
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server kafka:29092 \
  --alter \
  --topic orders.created \
  --partitions 8
```

Importante: Kafka permite aumentar partitions, mas nao diminuir.

### Offset

Offset e a posicao de uma mensagem dentro de uma partition. O Playground mostra o offset em cada evento processado. O Kafka UI tambem permite visualizar offsets.

Offsets ajudam a responder: "ate onde este consumer ja leu?".

### Consumer Group

Consumer group e um grupo logico de consumers que dividem o trabalho.

Neste projeto:

- email usa `email-service`;
- stock usa `stock-service`;
- analytics usa `analytics-service`.

Como cada worker esta em um grupo diferente, todos recebem o evento. Isso e fan-out: o mesmo pedido dispara email, estoque e analytics.

Para testar distribuicao dentro do mesmo grupo, rode dois workers de email em terminais diferentes:

```bash
npm run dev:email
CONSUMER_GROUP=email-service npm run dev:email
```

Gere muitos pedidos no Playground. Como ambos estao no mesmo group, Kafka distribui partitions entre eles. Uma mensagem sera processada por apenas um dos workers de email daquele grupo.

### Broker

Broker e um servidor Kafka. O Compose sobe um broker unico chamado `kafka`. Em producao, voce teria varios brokers para alta disponibilidade.

No Kafka UI, abra `Brokers` para ver o broker local.

### Replication

Replication e quantas copias uma partition possui em brokers diferentes. Como este laboratorio usa um broker local, os topicos usam replication factor `1`.

Em producao, um valor comum e `3`, desde que existam pelo menos 3 brokers.

### Lag

Lag e a diferenca entre o ultimo offset produzido e o ultimo offset consumido por um consumer group.

Se voce gerar 10.000 pedidos e um worker estiver lento, o Kafka UI mostrara lag subindo. Conforme o worker processa as mensagens, o lag cai.

### Retry

Retry e tentar processar novamente uma mensagem que falhou.

Neste projeto, se um handler fizer:

```ts
throw new Error("Falha simulada");
```

o `BaseConsumer` captura a falha, incrementa o header `x-retry-count` e republica a mensagem no mesmo topico ate o limite configurado.

Para simular:

- use SKU `FAIL_EMAIL`;
- use SKU `FAIL_STOCK`;
- use SKU `FAIL_ANALYTICS`.

Voce vera logs como:

```text
[EMAIL] Falha no processamento. Reenfileirando retry
[EMAIL] retry: 1
```

### Dead Letter Queue

DLQ e um topico para mensagens que nao conseguiram ser processadas apos X tentativas.

Fluxo deste projeto:

1. Consumer recebe `orders.created`.
2. Handler falha com `throw Error(...)`.
3. `BaseConsumer` republica para retry.
4. Apos 3 retries, publica em `orders.created.dlq`.
5. O Playground destaca a falha.
6. O Kafka UI permite inspecionar a mensagem na DLQ.

### Throughput

Throughput e a quantidade de mensagens processadas por unidade de tempo.

Use os botoes do Playground para gerar 100, 1.000 ou 10.000 pedidos. Depois observe:

- mensagens chegando no topico;
- offsets subindo;
- lag dos consumer groups;
- workers processando em paralelo.

### Escalabilidade

Kafka escala com partitions e consumers.

Se `orders.created` tem 4 partitions, um consumer group pode ter ate 4 consumers processando em paralelo de forma efetiva. Se voce rodar 10 consumers no mesmo group com apenas 4 partitions, 6 ficarao ociosos.

## Por Que Usar `order.id` Como Key

A key define a partition de destino. Usar `order.id` significa que todos os eventos do mesmo pedido vao para a mesma partition.

Isso e importante quando a ordem por entidade importa. Kafka preserva ordem dentro de uma partition, mas nao entre partitions.

Neste projeto ha apenas `orders.created`, mas a regra prepara o laboratorio para eventos futuros como `orders.paid`, `orders.cancelled` e `orders.shipped`.

## Idempotencia

Consumers podem receber mensagens duplicadas. Isso pode acontecer por retry, rebalance, crash apos processar e antes de commitar offset, ou publicacao duplicada.

Por isso existe a tabela `ProcessedMessage`.

Cada worker grava:

```text
service:eventId
```

Se a mesma mensagem chegar de novo para o mesmo servico, o `BaseConsumer` ignora e loga "Mensagem duplicada ignorada".

Sem idempotencia, um email poderia ser enviado duas vezes, um estoque poderia ser baixado duas vezes, ou uma metrica poderia ser incrementada indevidamente.

## Kafka UI

Abra `http://localhost:8080`.

Use a interface para ver:

- Topics: `orders.created` e `orders.created.dlq`.
- Brokers: broker local.
- Partitions: 4 partitions iniciais.
- Consumer Groups: `email-service`, `stock-service`, `analytics-service`.
- Mensagens: payloads JSON publicados.
- Offsets: posicao das mensagens.
- Lag: atraso dos consumers.

## Logs Esperados

API:

```text
[API] Pedido criado
[KAFKA] Publicando evento
[API] API Fastify pronta
```

Email:

```text
[EMAIL] Recebido pedido
[EMAIL] Enviando email...
```

Stock:

```text
[STOCK] Recebido pedido
[STOCK] Baixando estoque...
```

Analytics:

```text
[ANALYTICS] Recebido pedido
[ANALYTICS] Atualizando metricas...
```

## Arquivos Criados E Responsabilidades

### Raiz

- `package.json`: define o monorepo com npm workspaces e scripts principais.
- `tsconfig.base.json`: configuracao TypeScript strict compartilhada.
- `.env.example`: variaveis necessarias para API, workers e Playground.
- `.gitignore`: ignora dependencias, builds e arquivos locais.
- `docker-compose.yml`: sobe PostgreSQL, Kafka em KRaft, Kafka UI e cria os topicos iniciais.

### `packages/shared`

- `package.json`: pacote compartilhado usado por API e workers.
- `prisma/schema.prisma`: modelos de pedido, eventos de processamento, idempotencia e metricas.
- `src/env.ts`: leitura tipada de variaveis de ambiente.
- `src/logger.ts`: logs coloridos por servico.
- `src/prisma.ts`: Prisma Client compartilhado.
- `src/types.ts`: contratos de eventos, DTOs e metadados Kafka.
- `src/processing-events.ts`: grava etapas do fluxo no PostgreSQL.
- `src/sleep.ts`: delays artificiais dos workers.
- `src/index.ts`: barrel exports do pacote.

### `packages/kafka`

- `src/connection.ts`: cria cliente KafkaJS.
- `src/producer.ts`: producer reutilizavel com `publish`.
- `src/base-consumer.ts`: classe base com consumer, retry, DLQ, idempotencia e metadados.
- `src/index.ts`: exports publicos.

### `apps/api`

- `src/domain/order.ts`: entidade de dominio `Order`.
- `src/application/create-order.ts`: caso de uso que salva pedido e publica evento.
- `src/application/ports.ts`: contrato do repositorio de pedidos.
- `src/infra/prisma-order-repository.ts`: implementacao Prisma do repositorio.
- `src/presentation/order-routes.ts`: rotas HTTP, carga em massa, listagem e SSE.
- `src/server.ts`: bootstrap Fastify.

### `apps/worker-email`

- `src/email-consumer.ts`: consumer que simula envio de email, delay de 2s e falha com SKU `FAIL_EMAIL`.
- `src/main.ts`: inicia o processo do worker.

### `apps/worker-stock`

- `src/stock-consumer.ts`: consumer que simula baixa de estoque, delay de 1s e falha com SKU `FAIL_STOCK`.
- `src/main.ts`: inicia o processo do worker.

### `apps/worker-analytics`

- `src/analytics-consumer.ts`: consumer que simula analytics, delay de 500ms, atualiza metricas e falha com SKU `FAIL_ANALYTICS`.
- `src/main.ts`: inicia o processo do worker.

### `apps/playground`

- `app/page.tsx`: interface Kafka Playground para criar pedidos, gerar carga, acompanhar etapas, offsets, partitions, timestamps e DLQ.
- `app/layout.tsx`: layout raiz do Next.js.
- `app/globals.css`: estilos da interface.
- `next.config.ts`, `tsconfig.json`, `next-env.d.ts`: configuracao do app Next.js.

## Experimentos Recomendados

1. Crie um pedido normal e observe os tres workers processando em tempos diferentes.
2. Crie um pedido com SKU `FAIL_EMAIL` e acompanhe retry e DLQ.
3. Gere 1.000 pedidos e observe lag no Kafka UI.
4. Rode dois workers de email no mesmo consumer group e veja a distribuicao.
5. Aumente partitions para 8 e compare o comportamento sob carga.
