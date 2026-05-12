from typing import Protocol

from src.domain.message import Message


class TextExtractorPort(Protocol):
    def extract(self, file_bytes: bytes) -> str: ...


class EmbeddingsPort(Protocol):
    def embed_documents(self, chunks: list[str]) -> list[list[float]]: ...

    def embed_query(self, query: str) -> list[float]: ...


class VectorStorePort(Protocol):
    def add(self, texts: list[str], embeddings: list[list[float]]) -> None: ...

    def search(self, query_embedding: list[float], k: int = 3) -> list[str]: ...


class LLMPort(Protocol):
    def invoke(self, prompt: str): ...


class MessageHistoryPort(Protocol):
    def add(self, message: Message) -> None: ...

    def list(self) -> list[Message]: ...

    def clear(self) -> None: ...
