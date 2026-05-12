from celery import Celery

from src.core.config import settings

celery_app = Celery(
    "docmind",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["src.workers.email_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
)

if settings.CELERY_TASK_ALWAYS_EAGER:
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
