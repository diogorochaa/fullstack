from datetime import datetime
import uuid
from uuid import UUID

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from src.domain.exceptions import ServiceUnavailableError
from src.domain.message import Message


class PostgresMessageHistoryGateway:
    def __init__(self, database_url: str, user_id: UUID):
        self._engine = create_engine(database_url, pool_pre_ping=True)
        self._user_id = user_id
        self._ensure_table()

    def _ensure_table(self) -> None:
        try:
            with self._engine.begin() as conn:
                conn.execute(
                    text(
                        """
                        CREATE TABLE IF NOT EXISTS messages (
                            id BIGSERIAL PRIMARY KEY,
                            user_id UUID,
                            conversation_id UUID,
                            role VARCHAR(20) NOT NULL,
                            content TEXT NOT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                        )
                        """
                    )
                )
                conn.execute(
                    text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id UUID")
                )
                conn.execute(
                    text(
                        "ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID"
                    )
                )
                rows = conn.execute(
                    text(
                        "SELECT DISTINCT user_id FROM messages WHERE conversation_id IS NULL AND user_id IS NOT NULL"
                    )
                ).scalars().all()
                for user_id in rows:
                    conn.execute(
                        text(
                            "UPDATE messages SET conversation_id = :conversation_id WHERE user_id = :user_id AND conversation_id IS NULL"
                        ),
                        {"conversation_id": str(uuid.uuid4()), "user_id": user_id},
                    )
                conn.execute(
                    text(
                        """
                        CREATE INDEX IF NOT EXISTS ix_messages_user_conv_created_id
                        ON messages (user_id, conversation_id, created_at, id)
                        """
                    )
                )
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc

    def add(self, message: Message) -> None:
        stmt = text(
            "INSERT INTO messages (user_id, conversation_id, role, content, created_at) VALUES (:user_id, :conversation_id, :role, :content, NOW())"
        )
        try:
            with self._engine.begin() as conn:
                conn.execute(
                    stmt,
                    {
                        "user_id": str(self._user_id),
                        "conversation_id": message.conversation_id,
                        "role": message.role,
                        "content": message.content,
                    },
                )
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc

    def list(self) -> list[Message]:
        query = text(
            "SELECT conversation_id, role, content, created_at FROM messages WHERE user_id = :user_id ORDER BY created_at ASC, id ASC"
        )
        try:
            with self._engine.connect() as conn:
                rows = conn.execute(query, {"user_id": str(self._user_id)}).all()
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc

        result: list[Message] = []
        for row in rows:
            created_at = row.created_at
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            result.append(
                Message(
                    conversation_id=str(row.conversation_id),
                    role=row.role,
                    content=row.content,
                    created_at=str(created_at),
                )
            )
        return result

    def clear(self) -> None:
        try:
            with self._engine.begin() as conn:
                conn.execute(
                    text("DELETE FROM messages WHERE user_id = :user_id"),
                    {"user_id": str(self._user_id)},
                )
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc
