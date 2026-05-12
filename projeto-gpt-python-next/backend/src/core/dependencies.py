from functools import lru_cache

from langchain_openai import ChatOpenAI

from src.core.config import settings
from src.infrastructure.adapters.faiss_vector_store_adapter import (
    FaissVectorStoreAdapter,
)
from src.infrastructure.adapters.openai_embeddings_adapter import (
    OpenAIEmbeddingsAdapter,
)
from src.infrastructure.adapters.pdf_text_extractor import (
    PdfTextExtractorAdapter,
)
from src.infrastructure.gateways.postgres_message_history import (
    PostgresMessageHistoryGateway,
)


def get_settings():
    return settings


@lru_cache
def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.OPENAI_API_KEY,
    )


@lru_cache
def get_embeddings_adapter():
    return OpenAIEmbeddingsAdapter()


@lru_cache
def get_vector_store():
    return FaissVectorStoreAdapter()


@lru_cache
def get_pdf_text_extractor():
    return PdfTextExtractorAdapter()


@lru_cache
def get_message_history():
    return PostgresMessageHistoryGateway(settings.DATABASE_URL)
