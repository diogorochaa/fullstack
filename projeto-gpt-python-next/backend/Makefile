.PHONY: format lint fix test typecheck check install run worker infra-up infra-down infra-logs docker-up docker-down db-up db-down db-logs \
	migrate-up migrate-down migrate-current migrate-history migrate-revision migrate-revision-empty

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

run:
	uv run uvicorn src.main:app --reload

worker:
	uv run celery -A src.workers.celery_app worker --loglevel=info

infra-up:
	docker compose up -d postgres redis rabbitmq

infra-down:
	docker compose stop postgres redis rabbitmq

infra-logs:
	docker compose logs -f postgres redis rabbitmq

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

db-logs:
	docker compose logs -f postgres

# Migrations (defina DATABASE_URL ou use .env). Ex.: make migrate-revision m=add_column_x
migrate-up:
	PYTHONPATH=. uv run alembic upgrade head

migrate-down:
	PYTHONPATH=. uv run alembic downgrade -1

migrate-current:
	PYTHONPATH=. uv run alembic current

migrate-history:
	PYTHONPATH=. uv run alembic history

migrate-revision:
	PYTHONPATH=. uv run alembic revision --autogenerate -m "$(m)"

migrate-revision-empty:
	PYTHONPATH=. uv run alembic revision -m "$(m)"
