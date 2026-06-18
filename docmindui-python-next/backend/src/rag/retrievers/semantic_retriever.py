import uuid

from src.database.models.document import DocumentChunk
from src.database.repositories.chunk_repository import DocumentChunkRepository
from src.rag.embeddings.openai_embeddings import OpenAIEmbeddingsService


class SemanticRetriever:
    def __init__(
        self,
        chunk_repo: DocumentChunkRepository,
        embeddings: OpenAIEmbeddingsService,
        *,
        top_k: int = 5,
    ) -> None:
        self._chunk_repo = chunk_repo
        self._embeddings = embeddings
        self._top_k = top_k

    def retrieve(
        self,
        query: str,
        *,
        document_ids: list[uuid.UUID] | None = None,
    ) -> list[DocumentChunk]:
        query_embedding = self._embeddings.embed_query(query.strip() or "conteúdo geral")
        return self._chunk_repo.search_similar(
            query_embedding,
            top_k=self._top_k,
            document_ids=document_ids,
        )
