# Observabilidade — Shopmax

Stack **LGPM** para métricas e logs em desenvolvimento local:

| Ferramenta | Porta | Função |
|------------|-------|--------|
| Grafana | `3030` | Dashboards + exploração de logs |
| Prometheus | `9090` | Coleta de métricas |
| Loki | `3100` | Agregação de logs (via Grafana) |
| Kafka UI | `8080` | Inspeção de tópicos/mensagens |
| RabbitMQ Management | `15672` | Filas e bindings (`rabbit` / `rabbit`) |

## Subir a stack

```bash
./scripts/observability-up.sh
```

O script sincroniza `ECOMMERCE_API_HOST_IP` (IP do WSL) e sobe os serviços com profile `observability`.

**Grafana:** http://localhost:3030 — usuário `admin`, senha `admin`

## O que é monitorado

### Métricas (Prometheus)

| Origem | Endpoint / exporter | Métricas principais |
|--------|---------------------|---------------------|
| ecommerce-api (host) | `GET /metrics` | `http_requests_total`, `http_request_duration_seconds`, `kafka_messages_published_total`, `rabbitmq_messages_*` |
| ecommerce-ia | `GET /metrics` | HTTP por rota, `chat_requests_total`, `catalog_search_total` |
| Kafka | `kafka-exporter:9308` | Partições, brokers, consumer groups |
| RabbitMQ | `:15692` (plugin prometheus) | Filas, mensagens, conexões |

### Logs (Loki + Promtail)

Promtail coleta stdout dos containers Docker com labels `container` e `service`.

- **Kafka** — logs do broker
- **RabbitMQ** — logs do broker
- **ecommerce-ia** — logs JSON estruturados (`service`, `topic`, `queue`, `path`)

Logs da **ecommerce-api** (host) aparecem no terminal em JSON; não entram no Loki no MVP.

## Dashboards provisionados

Pasta `Shopmax` no Grafana:

1. **Shopmax Overview** — RPS API/IA, erros, mensagens Kafka/Rabbit
2. **API Endpoints** — latência e status por rota
3. **IA Chat** — requests texto/imagem, buscas por catálogo
4. **Kafka and RabbitMQ** — publish/consume + métricas dos brokers
5. **Logs Explorer** — Kafka, RabbitMQ e IA no Loki

## Queries Loki úteis

```logql
{container=~".*kafka.*"}
{container=~".*rabbitmq.*"}
{container=~".*ecommerce-ia.*"} | json | topic != ""
{container=~".*ecommerce-ia.*"} | json | queue != ""
```

## Troubleshooting

### Target `ecommerce-api` DOWN no Prometheus

A API roda no host WSL. Se o IP mudar:

```bash
./scripts/sync-docker-env.sh
docker compose -f docker-compose.yml -f docker-compose.observability.yml --profile observability up -d prometheus
```

Confirme que a API expõe métricas:

```bash
curl http://localhost:3000/metrics
```

### RabbitMQ prometheus não responde

Verifique se o plugin está ativo após recriar o container:

```bash
docker compose logs rabbitmq | grep prometheus
curl http://localhost:15692/metrics
```

### Sem logs no Loki

Promtail precisa de acesso ao Docker socket. No WSL, confirme que o container `promtail` está rodando:

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml --profile observability ps
```
