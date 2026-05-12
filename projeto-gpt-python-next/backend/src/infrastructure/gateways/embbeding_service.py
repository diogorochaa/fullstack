from langchain_openai import OpenAIEmbeddings

from src.core.config import settings
from src.domain.exceptions import MissingConfigurationError


def get_embeddings():
    if not settings.OPENAI_API_KEY:
        raise MissingConfigurationError("OPENAI_API_KEY nao configurada.")

    return OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY)
