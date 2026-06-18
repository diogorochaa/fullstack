from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from ecommerce_ia.config.settings import Settings


class OpenAIChatModelFactory:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def create(self) -> ChatOpenAI:
        return ChatOpenAI(
            model=self._settings.openai_model,
            api_key=self._settings.openai_api_key or None,
            temperature=0.3,
        )


class OpenAIEmbeddingFactory:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def create(self) -> OpenAIEmbeddings:
        return OpenAIEmbeddings(
            model=self._settings.embedding_model,
            api_key=self._settings.openai_api_key or None,
        )
