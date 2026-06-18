#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"${ROOT_DIR}/scripts/sync-docker-env.sh"

docker compose \
  -f "${ROOT_DIR}/docker-compose.yml" \
  -f "${ROOT_DIR}/docker-compose.observability.yml" \
  --profile observability \
  up -d

echo ""
echo "Observabilidade disponível em:"
echo "  Grafana:    http://localhost:3030  (admin / admin)"
echo "  Prometheus: http://localhost:9090"
echo "  Kafka UI:   http://localhost:8080"
echo "  RabbitMQ:   http://localhost:15672 (rabbit / rabbit)"
