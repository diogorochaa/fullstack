import uuid

from ecommerce_ia.application.catalog_readiness import CatalogReadinessService
from ecommerce_ia.domain.models import ChatImage, ChatResult
from ecommerce_ia.domain.ports.assistants import ShoppingAssistant
from ecommerce_ia.domain.ports.session_store import SessionStore


class CustomerChatUseCase:
    def __init__(
        self,
        assistant: ShoppingAssistant,
        session_store: SessionStore,
        catalog_readiness: CatalogReadinessService,
    ) -> None:
        self._assistant = assistant
        self._session_store = session_store
        self._catalog_readiness = catalog_readiness

    @staticmethod
    def _session_user_text(
        message: str,
        image: ChatImage | None,
        user_display: str | None,
    ) -> str:
        if image is None:
            return message
        if user_display:
            return f"[Foto enviada] {user_display}"
        return "[Foto enviada]"

    async def execute(
        self,
        message: str,
        session_id: str | None = None,
        *,
        image: ChatImage | None = None,
        user_display: str | None = None,
    ) -> ChatResult:
        active_session = session_id or str(uuid.uuid4())
        await self._catalog_readiness.ensure_ready()

        history = await self._session_store.get_messages(active_session)
        result = await self._assistant.run(message, history=history, image=image)

        session_text = self._session_user_text(message, image, user_display)
        await self._session_store.append_exchange(
            active_session,
            session_text,
            result.reply,
        )

        return ChatResult(
            reply=result.reply,
            session_id=active_session,
            sources=result.sources,
        )
