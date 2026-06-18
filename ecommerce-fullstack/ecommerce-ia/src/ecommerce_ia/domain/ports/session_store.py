from typing import Protocol


class SessionMessage(Protocol):
    role: str
    content: str


class SessionStore(Protocol):
    async def get_messages(self, session_id: str) -> list[dict[str, str]]: ...

    async def append_exchange(
        self,
        session_id: str,
        user_message: str,
        assistant_reply: str,
    ) -> None: ...
