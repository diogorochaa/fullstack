from src.infrastructure.gateways.embbeding_service import get_embeddings


class OpenAIEmbeddingsAdapter:
    def __init__(self):
        self._client = get_embeddings()

    def embed_documents(self, chunks: list[str]) -> list[list[float]]:
        return self._client.embed_documents(chunks)

    def embed_query(self, query: str) -> list[float]:
        return self._client.embed_query(query)
