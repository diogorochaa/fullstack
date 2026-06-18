import logging

from ecommerce_ia.infrastructure.vector.chroma_store import ChromaVectorStore
from ecommerce_ia.infrastructure.vector.constants import (
    CATALOG_COLLECTION,
    FAQ_COLLECTION,
)

logger = logging.getLogger(__name__)


class ChromaContextRetriever:
    """Recupera trechos FAQ + catálogo para enriquecer o prompt do assistente."""

    def __init__(self, vector_store: ChromaVectorStore) -> None:
        self._vector_store = vector_store

    async def retrieve(self, query: str, *, k: int = 3) -> list[str]:
        chunks: list[str] = []

        for collection_name in (FAQ_COLLECTION, CATALOG_COLLECTION):
            try:
                store = self._vector_store.get_store(collection_name)
                results = store.similarity_search(query, k=k)
                chunks.extend(doc.page_content for doc in results)
            except Exception as error:
                logger.debug("RAG retrieve failed for %s: %s", collection_name, error)

        return chunks
