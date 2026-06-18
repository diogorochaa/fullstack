from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent

from ecommerce_ia.domain.models import AssistantReply, ChatImage, ChatSource
from ecommerce_ia.domain.ports.catalog import CatalogReader
from ecommerce_ia.infrastructure.llm.catalog_tools import build_catalog_tools
from ecommerce_ia.infrastructure.llm.image_catalog_matcher import ImageCatalogMatcher
from ecommerce_ia.infrastructure.llm.openai_client import OpenAIChatModelFactory
from ecommerce_ia.infrastructure.llm.prompts import build_system_message
from ecommerce_ia.infrastructure.vector.chroma_retriever import ChromaContextRetriever
from ecommerce_ia.infrastructure.vector.chroma_store import ChromaVectorStore


class LangGraphShoppingAssistant:
    """Agente ReAct (LangGraph) para o assistente de compras."""

    def __init__(
        self,
        chat_models: OpenAIChatModelFactory,
        retriever: ChromaContextRetriever,
        catalog: CatalogReader,
        vector_store: ChromaVectorStore,
    ) -> None:
        self._chat_models = chat_models
        self._retriever = retriever
        self._catalog = catalog
        self._vector_store = vector_store
        self._image_matcher = ImageCatalogMatcher(
            chat_models,
            catalog,
            self._search_index,
        )
        self._agent = None

    def _search_index(self, query: str, limit: int) -> str:
        return self._vector_store.search_catalog(query, limit=limit)

    def _get_agent(self):
        if self._agent is None:
            self._agent = create_react_agent(
                self._chat_models.create(),
                build_catalog_tools(self._catalog, self._search_index),
            )
        return self._agent

    @staticmethod
    def _extract_sources(messages: list[Any]) -> tuple[ChatSource, ...]:
        sources: list[ChatSource] = []
        seen: set[str] = set()

        for message in messages:
            if message.type != "tool":
                continue
            content = str(message.content)
            if '"id"' not in content and "id:" not in content:
                continue

            for line in content.splitlines():
                if "id:" in line and "/products/" in line:
                    parts = line.split("id:")
                    if len(parts) < 2:
                        continue
                    product_id = parts[1].split("|")[0].strip()
                    if product_id and product_id not in seen:
                        seen.add(product_id)
                        sources.append(ChatSource(type="product", id=product_id))

        return tuple(sources)

    @staticmethod
    def _history_to_messages(
        history: list[dict[str, str]] | None,
    ) -> list[HumanMessage | AIMessage]:
        messages: list[HumanMessage | AIMessage] = []
        for entry in history or []:
            role = entry.get("role")
            content = entry.get("content", "")
            if not content:
                continue
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))
        return messages

    @staticmethod
    def _build_user_message(message: str, image: ChatImage | None) -> HumanMessage:
        content: list[str | dict[str, object]] = [{"type": "text", "text": message}]
        if image is not None:
            content.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{image.mime_type};base64,{image.data}",
                    },
                }
            )
        return HumanMessage(content=content)

    @staticmethod
    def _rag_query(
        message: str,
        image: ChatImage | None,
        search_terms: tuple[str, ...] | None = None,
    ) -> str:
        if search_terms:
            return search_terms[0]
        if image is not None and len(message.strip()) < 20:
            return "produto catálogo"
        return message

    @staticmethod
    def _merge_sources(
        primary: tuple[ChatSource, ...],
        secondary: tuple[ChatSource, ...],
    ) -> tuple[ChatSource, ...]:
        seen: set[str] = set()
        merged: list[ChatSource] = []
        for source in (*primary, *secondary):
            if source.id in seen:
                continue
            seen.add(source.id)
            merged.append(source)
        return tuple(merged)

    async def run(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
        image: ChatImage | None = None,
    ) -> AssistantReply:
        image_bundle = None
        if image is not None:
            image_bundle = await self._image_matcher.match(message, image)

        rag_query = self._rag_query(
            message,
            image,
            image_bundle.search_terms if image_bundle else None,
        )
        context_chunks = await self._retriever.retrieve(rag_query)
        rag_context = "\n\n".join(context_chunks)
        system_message = build_system_message(
            rag_context, has_image_search=image is not None
        )

        user_message = (
            HumanMessage(content=image_bundle.build_enriched_message(message))
            if image_bundle
            else self._build_user_message(message, image)
        )

        agent = self._get_agent()
        conversation = [
            SystemMessage(content=system_message),
            *self._history_to_messages(history),
            user_message,
        ]
        result = await agent.ainvoke({"messages": conversation})

        messages = result.get("messages", [])
        reply = "Desculpe, não consegui responder agora."
        for message_obj in reversed(messages):
            if isinstance(message_obj, AIMessage) and message_obj.content:
                reply = str(message_obj.content)
                break

        agent_sources = self._extract_sources(messages)
        image_sources = image_bundle.sources if image_bundle else ()

        return AssistantReply(
            reply=reply,
            sources=self._merge_sources(image_sources, agent_sources),
            context=tuple(context_chunks),
        )
