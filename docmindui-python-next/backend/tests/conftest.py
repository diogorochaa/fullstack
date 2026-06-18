import os

import pytest

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("CELERY_BROKER_URL", "memory://")
os.environ.setdefault("CELERY_RESULT_BACKEND", "cache+memory://")
os.environ.setdefault("CELERY_TASK_ALWAYS_EAGER", "true")
os.environ.setdefault(
    "SECRET_KEY",
    "test-secret-key-at-least-32-characters-long-for-jwt",
)


@pytest.fixture(scope="session", autouse=True)
def _create_db_schema():
    from src.database.models import Base
    from src.database.session import engine

    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
