from ecommerce_ia.infrastructure.vector.chroma_store import ChromaVectorStore


class FaqIndexingService:
    def __init__(self, vector_store: ChromaVectorStore) -> None:
        self._vector_store = vector_store

    def index(self) -> int:
        return self._vector_store.index_faq()
