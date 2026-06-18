"""Filas RabbitMQ usadas pelo Celery (roteamento em celery_app)."""

DOCUMENTS_QUEUE = "documents"
EMAILS_QUEUE = "emails"
DEFAULT_QUEUE = "default"

ALL_QUEUES = (DEFAULT_QUEUE, DOCUMENTS_QUEUE, EMAILS_QUEUE)
