#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
HOST_IP="$(hostname -I | awk '{print $1}')"

if [[ -z "${HOST_IP}" ]]; then
  echo "Não foi possível detectar o IP do host WSL." >&2
  exit 1
fi

touch "${ENV_FILE}"
if grep -q '^ECOMMERCE_API_HOST_IP=' "${ENV_FILE}"; then
  sed -i "s/^ECOMMERCE_API_HOST_IP=.*/ECOMMERCE_API_HOST_IP=${HOST_IP}/" "${ENV_FILE}"
else
  echo "ECOMMERCE_API_HOST_IP=${HOST_IP}" >> "${ENV_FILE}"
fi

echo "ECOMMERCE_API_HOST_IP=${HOST_IP}"
