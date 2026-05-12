.PHONY: format lint fix test typecheck check install dev run migrate generate infra-up infra-down infra-logs

format:
	uv run ruff format .

lint:
	uv run ruff check .

fix:
	uv run ruff check . --fix
	uv run ruff format .

test:
	PYTHONPATH=. uv run pytest -q

typecheck:
	uv run mypy src

check:
	uv run ruff check .
	uv run ruff format --check .
	PYTHONPATH=. uv run pytest -q

install:
	uv sync

dev:
	uv run uvicorn src.main:app --reload --port 8001

run:
	docker compose logs -f api

migrate:
	PYTHONPATH=. uv run alembic upgrade head

generate:
	PYTHONPATH=. uv run alembic revision --autogenerate -m "$(m)"

infra-up:
	docker compose up -d redis rabbitmq

infra-down:
	docker compose stop redis rabbitmq

infra-logs:
	docker compose logs -f redis rabbitmq
