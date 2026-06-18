"""Tarefas Celery relacionadas a documentos e indexação."""

from celery import shared_task

from src.database.repositories.chunk_repository import DocumentChunkRepository
from src.database.repositories.document_repository import DocumentRepository
from src.database.session import SessionLocal
from src.rag.embeddings.openai_embeddings import OpenAIEmbeddingsService
from src.schemas.document import DocumentMetadataDTO
from src.services.document.document_service import DocumentService


@shared_task(
    name="documents.index_document",
    autoretry_for=(OSError, ConnectionError),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def index_document_task(
    file_bytes: bytes,
    filename: str,
    text: str,
    metadata_dict: dict,
) -> dict[str, str | int]:
    metadata = DocumentMetadataDTO.model_validate(metadata_dict)
    db = SessionLocal()
    try:
        embeddings = OpenAIEmbeddingsService()
        service = DocumentService(
            db,
            DocumentRepository(db),
            DocumentChunkRepository(db),
            embeddings,
        )
        document, chunks = service.index_document(
            file_bytes=file_bytes,
            filename=filename,
            text=text,
            metadata=metadata,
        )
        return {"document_id": str(document.id), "chunks_indexed": chunks}
    finally:
        db.close()
