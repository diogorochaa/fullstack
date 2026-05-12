from src.infrastructure.gateways.faiss_store import VectorStore


class FaissVectorStoreAdapter:
    def __init__(self):
        self._store = VectorStore()

    def add(self, texts: list[str], embeddings: list[list[float]]) -> None:
        self._store.add(texts, embeddings)

    def search(self, query_embedding: list[float], k: int = 3) -> list[str]:
        return self._store.search(query_embedding, k)
