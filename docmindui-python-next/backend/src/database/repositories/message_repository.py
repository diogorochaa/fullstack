from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from src.database.models.message import ChatMessage
from src.schemas.message import MessageDTO


class MessageRepository:
    def __init__(self, db: Session, user_id: UUID) -> None:
        self._db = db
        self._user_id = user_id

    def add(self, message: MessageDTO) -> ChatMessage:
        row = ChatMessage(
            user_id=self._user_id,
            conversation_id=message.conversation_id,
            role=message.role,
            content=message.content,
        )
        self._db.add(row)
        self._db.flush()
        return row

    def list(self) -> list[ChatMessage]:
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.user_id == self._user_id)
            .order_by(ChatMessage.created_at, ChatMessage.id)
        )
        return list(self._db.execute(stmt).scalars().all())

    def clear(self) -> None:
        stmt = delete(ChatMessage).where(ChatMessage.user_id == self._user_id)
        self._db.execute(stmt)

    def delete_by_conversation(self, conversation_id: UUID) -> None:
        stmt = delete(ChatMessage).where(
            ChatMessage.user_id == self._user_id,
            ChatMessage.conversation_id == conversation_id,
        )
        self._db.execute(stmt)
