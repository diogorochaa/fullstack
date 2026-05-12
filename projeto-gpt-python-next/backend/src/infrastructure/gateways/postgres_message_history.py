from datetime import datetime

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from src.domain.exceptions import ServiceUnavailableError
from src.domain.message import Message


class PostgresMessageHistoryGateway:
    def __init__(self, database_url: str):
        self._engine = create_engine(database_url, pool_pre_ping=True)
        self._ensure_table()

    def _ensure_table(self) -> None:
        ddl = """
        CREATE TABLE IF NOT EXISTS messages (
            id BIGSERIAL PRIMARY KEY,
            role VARCHAR(20) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
        try:
            with self._engine.begin() as conn:
                conn.execute(text(ddl))
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc

    def add(self, message: Message) -> None:
        stmt = text(
            "INSERT INTO messages (role, content, created_at) VALUES (:role, :content, NOW())"
        )
        try:
            with self._engine.begin() as conn:
                conn.execute(stmt, {"role": message.role, "content": message.content})
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc

    def list(self) -> list[Message]:
        query = text(
            "SELECT role, content, created_at FROM messages ORDER BY created_at ASC, id ASC"
        )
        try:
            with self._engine.connect() as conn:
                rows = conn.execute(query).all()
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
                conn.execute(text("TRUNCATE TABLE messages RESTART IDENTITY"))
        except SQLAlchemyError as exc:
            raise ServiceUnavailableError("PostgreSQL indisponivel no momento.") from exc
