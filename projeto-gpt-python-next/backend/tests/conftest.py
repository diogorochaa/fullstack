import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("CELERY_BROKER_URL", "memory://")
os.environ.setdefault("CELERY_RESULT_BACKEND", "cache+memory://")
os.environ.setdefault("CELERY_TASK_ALWAYS_EAGER", "true")
os.environ.setdefault(
    "SECRET_KEY",
    "test-secret-key-at-least-32-characters-long-for-jwt",
)


def pytest_sessionstart(session):  # noqa: ARG001
    """TestClient sem context manager nao dispara lifespan; garante schema SQLite."""
    from src.infrastructure.database.models import Base
    from src.infrastructure.database.session import engine

    Base.metadata.create_all(bind=engine)
