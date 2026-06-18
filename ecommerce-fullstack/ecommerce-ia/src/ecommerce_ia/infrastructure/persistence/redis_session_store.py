import json
import logging

from redis.asyncio import Redis

from ecommerce_ia.config.settings import Settings

logger = logging.getLogger(__name__)

MAX_MESSAGES = 20
SESSION_TTL_SECONDS = 86_400


class RedisSessionStore:
    """Persiste histórico de chat multi-turn no Redis."""

    def __init__(self, settings: Settings) -> None:
        self._redis = Redis.from_url(settings.redis_url, decode_responses=True)
        self._prefix = "chat:session:"

    def _key(self, session_id: str) -> str:
        return f"{self._prefix}{session_id}"

    async def get_messages(self, session_id: str) -> list[dict[str, str]]:
        try:
            raw = await self._redis.get(self._key(session_id))
            if not raw:
                return []
            data = json.loads(raw)
            if isinstance(data, list):
                return [
                    {"role": str(item["role"]), "content": str(item["content"])}
                    for item in data
                    if isinstance(item, dict) and "role" in item and "content" in item
                ]
        except Exception as error:
            logger.warning("Failed to read session %s: %s", session_id, error)
        return []

    async def append_exchange(
        self,
        session_id: str,
        user_message: str,
        assistant_reply: str,
    ) -> None:
        messages = await self.get_messages(session_id)
        messages.extend(
            [
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": assistant_reply},
            ]
        )
        if len(messages) > MAX_MESSAGES:
            messages = messages[-MAX_MESSAGES:]

        try:
            await self._redis.set(
                self._key(session_id),
                json.dumps(messages, ensure_ascii=False),
                ex=SESSION_TTL_SECONDS,
            )
        except Exception as error:
            logger.warning("Failed to save session %s: %s", session_id, error)
