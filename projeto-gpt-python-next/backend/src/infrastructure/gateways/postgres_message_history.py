from datetime import datetime
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
                        """
                        CREATE INDEX IF NOT EXISTS ix_messages_user_id_created_at_id
                        ON messages (user_id, created_at, id)
                        """
                    )
                )
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc

    def add(self, message: Message) -> None:
        stmt = text(
            "INSERT INTO messages (user_id, role, content, created_at) VALUES (:user_id, :role, :content, NOW())"
        )
        try:
            with self._engine.begin() as conn:
                conn.execute(
                    stmt,
                    {
                        "user_id": str(self._user_id),
                        "role": message.role,
                        "content": message.content,
                    },
                )
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc

    def list(self) -> list[Message]:
        query = text(
            "SELECT role, content, created_at FROM messages WHERE user_id = :user_id ORDER BY created_at ASC, id ASC"
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
