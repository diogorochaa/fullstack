import uuid
from datetime import timedelta
from pathlib import Path

from fastapi import UploadFile

from src.core.config import settings
from src.core.exceptions import InvalidDocumentError
from src.database.models.document import Document
from src.rag.loaders.pdf_loader import extract_text_from_pdf
from src.schemas.document import DocumentResponse, DocumentUploadResponse
from src.services.document.document_service import DocumentService
from src.services.document.metadata_service import DocumentMetadataService
from src.services.knowledge_base.knowledge_base_service import KnowledgeBaseService


def _document_response(
    document: Document,
    *,
    chunks_count: int = 0,
    index_ready: bool = False,
) -> DocumentResponse:
    base_nome = document.knowledge_base.nome if document.knowledge_base else None
    ativo = chunks_count > 0 and index_ready
    vigencia = document.updated_at + timedelta(days=365)
    return DocumentResponse(
        id=document.id,
        titulo=document.titulo,
        palavras_chave=document.palavras_chave,
        resumo=document.resumo,
        arquivo_original=document.arquivo_original,
        knowledge_base_id=document.knowledge_base_id,
        knowledge_base_nome=base_nome,
        created_at=document.created_at,
        updated_at=document.updated_at,
        status="ativo" if ativo else "inativo",
        chunks_count=chunks_count,
        index_ready=index_ready,
        vigencia=vigencia,
    )


def _enriched_response(document: Document, service: DocumentService) -> DocumentResponse:
    total, with_emb = service.get_indexing_stats(document.id)
    index_ready = total > 0 and with_emb == total
    if document.knowledge_base_id and document.knowledge_base is None:
        from src.database.models.knowledge_base import KnowledgeBase

        document.knowledge_base = service._db.get(KnowledgeBase, document.knowledge_base_id)
    return _document_response(
        document,
        chunks_count=total,
        index_ready=index_ready,
    )


class DocumentController:
    def __init__(
        self,
        document_service: DocumentService,
        metadata_service: DocumentMetadataService,
        knowledge_base_service: KnowledgeBaseService,
    ) -> None:
        self._documents = document_service
        self._metadata = metadata_service
        self._knowledge_bases = knowledge_base_service

    async def upload(
        self,
        file: UploadFile,
        *,
        knowledge_base_id: uuid.UUID | None = None,
    ) -> DocumentUploadResponse:
        content_type = (file.content_type or "").lower()
        if content_type and content_type != "application/pdf":
            raise InvalidDocumentError("Apenas arquivos PDF são aceitos.")

        content = await file.read()
        if len(content) > settings.DOCUMENT_MAX_BYTES:
            raise InvalidDocumentError("Arquivo excede o tamanho máximo permitido.")

        extraction = extract_text_from_pdf(content)
        filename = file.filename or "documento.pdf"
        metadata = self._metadata.extract(extraction.text, filename=filename)
        if knowledge_base_id is None:
            raise InvalidDocumentError("Selecione uma base de conhecimento antes de enviar o PDF.")
        resolved_base_id = self._knowledge_bases.resolve_base_id(knowledge_base_id)
        document, chunks = self._documents.index_document(
            file_bytes=content,
            filename=filename,
            text=extraction.text,
            metadata=metadata,
            knowledge_base_id=resolved_base_id,
        )
        return DocumentUploadResponse(
            status="document indexed",
            document=_enriched_response(document, self._documents),
            chunks_indexed=chunks,
            pages_extracted=extraction.pages_total,
            chars_extracted=extraction.chars_extracted,
            text_preview=extraction.text_preview,
        )

    def list_documents(
        self,
        *,
        knowledge_base_id: uuid.UUID | None = None,
    ) -> list[DocumentResponse]:
        resolved = self._knowledge_bases.resolve_base_id(knowledge_base_id)
        docs = self._documents.list_documents(knowledge_base_id=resolved)
        return [_enriched_response(d, self._documents) for d in docs]

    def get_file_path(self, document_id: uuid.UUID) -> Path:
        return self._documents.get_file_path(document_id)

    def reindex(self, document_id: uuid.UUID) -> DocumentResponse:
        doc = self._documents.reindex_document(document_id)
        return _enriched_response(doc, self._documents)

    def delete(self, document_id: uuid.UUID) -> None:
        self._documents.delete_document(document_id)
