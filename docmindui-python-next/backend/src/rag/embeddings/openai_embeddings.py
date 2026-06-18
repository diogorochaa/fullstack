from langchain_openai import OpenAIEmbeddings
from pydantic import SecretStr

from src.core.config import settings
from src.core.exceptions import MissingConfigurationError


class OpenAIEmbeddingsService:
    def __init__(self) -> None:
        if not settings.OPENAI_API_KEY:
            raise MissingConfigurationError("OPENAI_API_KEY não configurada.")
        self._client = OpenAIEmbeddings(api_key=SecretStr(settings.OPENAI_API_KEY))

    def embed_documents(self, chunks: list[str]) -> list[list[float]]:
        return self._client.embed_documents(chunks)

    def embed_query(self, query: str) -> list[float]:
        return self._client.embed_query(query)
