from uuid import UUID

from sqlalchemy.orm import Session

from src.database.models.message import ChatMessage
from src.database.repositories.message_repository import MessageRepository
from src.schemas.message import MessageDTO


class MessageService:
    def __init__(self, db: Session, repository: MessageRepository) -> None:
        self._db = db
        self._repository = repository

    def create_message(self, conversation_id: UUID, role: str, content: str) -> ChatMessage:
        row = self._repository.add(
            MessageDTO(conversation_id=conversation_id, role=role, content=content)
        )
        self._db.commit()
        self._db.refresh(row)
        return row

    def list_messages(self) -> list[ChatMessage]:
        return self._repository.list()

    def clear_messages(self) -> None:
        self._repository.clear()
        self._db.commit()

    def delete_conversation(self, conversation_id: UUID) -> None:
        self._repository.delete_by_conversation(conversation_id)
        self._db.commit()
