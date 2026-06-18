from celery import Celery
from kombu import Exchange, Queue

from src.core.config import settings
from src.workers.queues import DEFAULT_QUEUE, DOCUMENTS_QUEUE, EMAILS_QUEUE

celery_app = Celery(
    "docmind",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["src.workers.document_tasks", "src.workers.email_tasks"],
)

default_exchange = Exchange("docmind", type="topic")

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    task_default_queue=DEFAULT_QUEUE,
    task_default_exchange="docmind",
    task_default_exchange_type="topic",
    task_default_routing_key="default.#",
    task_queues=(
        Queue(DEFAULT_QUEUE, default_exchange, routing_key="default.#"),
        Queue(DOCUMENTS_QUEUE, default_exchange, routing_key="documents.#"),
        Queue(EMAILS_QUEUE, default_exchange, routing_key="emails.#"),
    ),
    task_routes={
        "documents.*": {"queue": DOCUMENTS_QUEUE, "routing_key": "documents.index"},
        "users.*": {"queue": EMAILS_QUEUE, "routing_key": "users.email"},
    },
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

if settings.CELERY_TASK_ALWAYS_EAGER:
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
