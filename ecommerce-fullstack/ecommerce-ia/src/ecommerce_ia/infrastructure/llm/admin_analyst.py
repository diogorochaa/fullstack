import json
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from ecommerce_ia.domain.models import AssistantReply
from ecommerce_ia.infrastructure.llm.admin_prompts import ADMIN_SYSTEM_PROMPT
from ecommerce_ia.infrastructure.llm.openai_client import OpenAIChatModelFactory


class OpenAIAdminAnalyst:
    """Analista administrativo — LLM direto com contexto JSON das métricas."""

    def __init__(self, chat_models: OpenAIChatModelFactory) -> None:
        self._chat_models = chat_models

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

    async def analyze(
        self,
        message: str,
        context: dict[str, Any],
        history: list[dict[str, str]] | None = None,
    ) -> AssistantReply:
        context_json = json.dumps(context, ensure_ascii=False, indent=2)
        system_content = (
            f"{ADMIN_SYSTEM_PROMPT}\n\n"
            f"Dados atuais da plataforma (JSON):\n```json\n{context_json}\n```"
        )

        model = self._chat_models.create()
        result = await model.ainvoke(
            [
                SystemMessage(content=system_content),
                *self._history_to_messages(history),
                HumanMessage(content=message),
            ]
        )

        reply = "Desculpe, não consegui analisar os dados agora."
        if isinstance(result, AIMessage) and result.content:
            reply = str(result.content)

        return AssistantReply(reply=reply)
