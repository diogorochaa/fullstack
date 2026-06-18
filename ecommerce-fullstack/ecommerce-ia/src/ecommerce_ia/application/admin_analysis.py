import uuid
from typing import Any

from ecommerce_ia.domain.models import ChatResult
from ecommerce_ia.domain.ports.assistants import AdminAnalyst
from ecommerce_ia.domain.ports.session_store import SessionStore


class AdminAnalysisUseCase:
    def __init__(
        self,
        analyst: AdminAnalyst,
        session_store: SessionStore,
    ) -> None:
        self._analyst = analyst
        self._session_store = session_store

    async def execute(
        self,
        message: str,
        context: dict[str, Any],
        session_id: str | None = None,
    ) -> ChatResult:
        active_session = session_id or str(uuid.uuid4())
        history = await self._session_store.get_messages(
            f"admin:{active_session}",
        )
        result = await self._analyst.analyze(message, context, history=history)

        await self._session_store.append_exchange(
            f"admin:{active_session}",
            message,
            result.reply,
        )

        return ChatResult(
            reply=result.reply,
            session_id=active_session,
            sources=result.sources,
        )
