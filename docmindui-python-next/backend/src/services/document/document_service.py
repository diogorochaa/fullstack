import logging
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from src.core.config import settings
from src.core.exceptions import DocumentNotFoundError, InvalidDocumentError
from src.database.models.document import Document, DocumentChunk
from src.database.models.knowledge_base import KnowledgeBase
from src.database.repositories.chunk_repository import DocumentChunkRepository
from src.database.repositories.document_repository import DocumentRepository
from src.rag.embeddings.openai_embeddings import OpenAIEmbeddingsService
from src.rag.loaders.pdf_loader import extract_text_from_pdf
from src.rag.retrievers.semantic_retriever import SemanticRetriever
from src.rag.splitters.recursive_splitter import split_text
from src.schemas.agent_activity import KnowledgeSourceDTO
from src.schemas.document import DocumentMetadataDTO

logger = logging.getLogger(__name__)


class DocumentService:
    def __init__(
        self,
        db: Session,
        documents: DocumentRepository,
        chunks: DocumentChunkRepository,
        embeddings: OpenAIEmbeddingsService | None = None,
        *,
        knowledge_base_id: uuid.UUID | None = None,
    ) -> None:
        self._db = db
        self._documents = documents
        self._chunks = chunks
        self._embeddings = embeddings
        self._knowledge_base_id = knowledge_base_id
        self._retriever: SemanticRetriever | None = None

    def _scoped_document_ids(self) -> list[uuid.UUID] | None:
        if self._knowledge_base_id is None:
            return None
        ids = self._documents.ids_for_base(self._knowledge_base_id)
        return ids or []

    def _embeddings_service(self) -> OpenAIEmbeddingsService:
        if self._embeddings is None:
            self._embeddings = OpenAIEmbeddingsService()
        return self._embeddings

    def _semantic_retriever(self) -> SemanticRetriever:
        if self._retriever is None:
            self._retriever = SemanticRetriever(
                self._chunks,
                self._embeddings_service(),
                top_k=settings.RAG_TOP_K,
            )
        return self._retriever

    def _storage_dir(self) -> Path:
        path = settings.documents_storage_path()
        path.mkdir(parents=True, exist_ok=True)
        return path

    def index_document(
        self,
        *,
        file_bytes: bytes,
        filename: str,
        text: str,
        metadata: DocumentMetadataDTO,
        knowledge_base_id: uuid.UUID | None = None,
    ) -> tuple[Document, int]:
        doc_id = uuid.uuid4()
        safe_name = f"{doc_id}_{Path(filename).name}"
        file_path = self._storage_dir() / safe_name
        file_path.write_bytes(file_bytes)

        keywords = ", ".join(metadata.palavras_chave)
        document = Document(
            id=doc_id,
            titulo=metadata.titulo,
            palavras_chave=keywords,
            resumo=metadata.resumo,
            arquivo_original=str(safe_name),
            knowledge_base_id=knowledge_base_id or self._knowledge_base_id,
        )
        self._documents.add(document)
        self._db.flush()

        text_chunks = split_text(text)
        if not text_chunks:
            raise InvalidDocumentError("Documento sem conteúdo para indexação.")

        vectors = self._embeddings_service().embed_documents(text_chunks)
        chunk_meta = {
            "titulo": metadata.titulo,
            "palavras_chave": keywords,
            "topicos": metadata.topicos,
            "entidades": metadata.entidades,
        }
        rows = [
            DocumentChunk(
                documento_id=document.id,
                chunk_index=index,
                content=chunk,
                embedding=vector,
                chunk_metadata=chunk_meta,
            )
            for index, (chunk, vector) in enumerate(zip(text_chunks, vectors, strict=True))
        ]
        self._chunks.add_chunks(rows)
        self._db.commit()
        self._db.refresh(document)
        if document.knowledge_base_id:
            document.knowledge_base = self._db.get(KnowledgeBase, document.knowledge_base_id)
        logger.info(
            "document_indexed document_id=%s base_id=%s chunks=%s preview=%s",
            document.id,
            document.knowledge_base_id,
            len(rows),
            (text_chunks[0][:120] if text_chunks else ""),
        )
        return document, len(rows)

    def list_documents(self, *, knowledge_base_id: uuid.UUID | None = None) -> list[Document]:
        return self._documents.list_all(knowledge_base_id=knowledge_base_id)

    def get_file_path(self, document_id: uuid.UUID) -> Path:
        doc = self.get_document(document_id)
        file_path = self._storage_dir() / doc.arquivo_original
        if not file_path.exists():
            raise DocumentNotFoundError("Arquivo PDF não encontrado no disco.")
        return file_path

    def get_indexing_stats(self, document_id: uuid.UUID) -> tuple[int, int]:
        return self._chunks.indexing_stats(document_id)

    def reindex_document(self, document_id: uuid.UUID) -> Document:
        doc = self.get_document(document_id)
        file_path = self.get_file_path(document_id)
        extraction = extract_text_from_pdf(file_path.read_bytes())
        metadata = DocumentMetadataDTO(
            titulo=doc.titulo,
            palavras_chave=[k.strip() for k in doc.palavras_chave.split(",") if k.strip()],
            resumo=doc.resumo,
        )
        self._chunks.delete_by_document(document_id)
        self._db.flush()
        text_chunks = split_text(extraction.text)
        if not text_chunks:
            raise InvalidDocumentError("Documento sem conteúdo para reindexação.")
        vectors = self._embeddings_service().embed_documents(text_chunks)
        chunk_meta = {
            "titulo": metadata.titulo,
            "palavras_chave": doc.palavras_chave,
        }
        rows = [
            DocumentChunk(
                documento_id=doc.id,
                chunk_index=index,
                content=chunk,
                embedding=vector,
                chunk_metadata=chunk_meta,
            )
            for index, (chunk, vector) in enumerate(zip(text_chunks, vectors, strict=True))
        ]
        self._chunks.add_chunks(rows)
        self._db.commit()
        self._db.refresh(doc)
        if doc.knowledge_base_id:
            doc.knowledge_base = self._db.get(KnowledgeBase, doc.knowledge_base_id)
        return doc

    def get_document(self, document_id: uuid.UUID) -> Document:
        doc = self._documents.get_by_id(document_id)
        if doc is None:
            raise DocumentNotFoundError("Documento não encontrado.")
        return doc

    def delete_document(self, document_id: uuid.UUID) -> None:
        doc = self.get_document(document_id)
        file_path = self._storage_dir() / doc.arquivo_original
        self._chunks.delete_by_document(document_id)
        self._documents.delete(doc)
        self._db.commit()
        if file_path.exists():
            file_path.unlink()

    def delete_documents_for_base(self, knowledge_base_id: uuid.UUID) -> int:
        docs = self._documents.list_all(knowledge_base_id=knowledge_base_id)
        if not docs:
            return 0
        storage = self._storage_dir()
        for doc in docs:
            self._chunks.delete_by_document(doc.id)
            self._documents.delete(doc)
            file_path = storage / doc.arquivo_original
            if file_path.exists():
                file_path.unlink()
        self._db.flush()
        return len(docs)

    def count_documents(self, *, knowledge_base_id: uuid.UUID | None = None) -> int:
        base_id = knowledge_base_id if knowledge_base_id is not None else self._knowledge_base_id
        return self._documents.count(knowledge_base_id=base_id)

    def _append_chunk_sources(
        self,
        chunks: list[DocumentChunk],
        sources: list[KnowledgeSourceDTO],
        seen_ids: set[uuid.UUID],
    ) -> None:
        for chunk in chunks:
            if chunk.documento_id in seen_ids:
                continue
            doc = self._documents.get_by_id(chunk.documento_id)
            if not doc:
                continue
            seen_ids.add(doc.id)
            sources.append(
                KnowledgeSourceDTO(
                    document_id=str(doc.id),
                    titulo=doc.titulo,
                    palavras_chave=doc.palavras_chave,
                    snippet=(chunk.content or "")[:280],
                )
            )

    def search_sources(self, query: str) -> list[KnowledgeSourceDTO]:
        sources: list[KnowledgeSourceDTO] = []
        seen_ids: set[uuid.UUID] = set()
        document_ids = self._scoped_document_ids()
        if document_ids is not None and len(document_ids) == 0:
            return sources

        try:
            chunks = self._semantic_retriever().retrieve(query, document_ids=document_ids)
        except Exception:
            logger.exception("semantic_search_failed query=%s", query[:80])
            chunks = []

        self._append_chunk_sources(chunks, sources, seen_ids)

        if len(sources) < settings.RAG_TOP_K:
            text_chunks = self._chunks.search_by_text(
                query,
                top_k=settings.RAG_TOP_K,
                document_ids=document_ids,
            )
            self._append_chunk_sources(text_chunks, sources, seen_ids)

        if not sources:
            allowed_ids: set[uuid.UUID] | None = None
            if self._knowledge_base_id is not None:
                allowed_ids = set(self._documents.ids_for_base(self._knowledge_base_id))
            for doc in self._documents.search_by_text(query, limit=3):
                if allowed_ids is not None and doc.id not in allowed_ids:
                    continue
                if doc.id in seen_ids:
                    continue
                sources.append(
                    KnowledgeSourceDTO(
                        document_id=str(doc.id),
                        titulo=doc.titulo,
                        palavras_chave=doc.palavras_chave,
                        snippet=(doc.resumo or "")[:280],
                    )
                )

        return sources

    def search_context(self, query: str) -> str:
        sources = self.search_sources(query)
        if not sources:
            total = self.count_documents()
            if total == 0:
                return (
                    "Nenhum documento na base de conhecimento. "
                    "O usuário deve enviar PDFs em Configurações."
                )
            return (
                f"Nenhum trecho relevante para a pergunta. "
                f"Há {total} documento(s) indexado(s), sem correspondência para esta busca."
            )
        parts = []
        for source in sources:
            parts.append(
                f"[{source.titulo}] (palavras-chave: {source.palavras_chave})\n{source.snippet}"
            )
        return "\n\n".join(parts)

    def get_keywords_for_query(self, query: str) -> str:
        sources = self.search_sources(query)
        if not sources:
            return ""
        return sources[0].palavras_chave
