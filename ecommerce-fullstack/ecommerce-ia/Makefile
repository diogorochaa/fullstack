.PHONY: help install sync dev lint format check test test-watch clean

UV ?= uv
APP ?= ecommerce_ia.main:socket_app
HOST ?= 0.0.0.0
PORT ?= 8100

help: ## Lista os comandos disponíveis
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: sync ## Alias para sync

sync: ## Instala dependências com uv
	$(UV) sync

dev: ## Sobe o servidor em modo desenvolvimento
	$(UV) run uvicorn $(APP) --reload --host $(HOST) --port $(PORT)

lint: ## Executa o Ruff (check)
	$(UV) run ruff check .

format: ## Formata o código com Ruff
	$(UV) run ruff format .

check: lint ## Lint + verificação de formatação
	$(UV) run ruff format --check .

test: ## Roda os testes com pytest
	$(UV) run pytest

test-watch: ## Roda pytest em modo watch
	$(UV) run pytest -f

index: ## Indexa FAQ e catálogo no Chroma
	$(UV) run python scripts/index_catalog.py

clean: ## Remove cache e artefatos locais
	rm -rf .pytest_cache .ruff_cache dist build *.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} +
