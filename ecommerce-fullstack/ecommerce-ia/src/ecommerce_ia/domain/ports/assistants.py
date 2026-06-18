from typing import Any, Protocol

from ecommerce_ia.domain.models import AssistantReply, ChatImage


class ShoppingAssistant(Protocol):
    async def run(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
        image: ChatImage | None = None,
    ) -> AssistantReply: ...


class AdminAnalyst(Protocol):
    async def analyze(
        self,
        message: str,
        context: dict[str, Any],
        history: list[dict[str, str]] | None = None,
    ) -> AssistantReply: ...
