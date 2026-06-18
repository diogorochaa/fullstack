from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from src.database.models.knowledge_base import KnowledgeBase

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON, TypeDecorator

from src.database.models.base import Base

EMBEDDING_DIM = 1536


class EmbeddingColumn(TypeDecorator):
    """Vector no PostgreSQL; JSON serializado no SQLite (testes)."""

    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):  # noqa: ANN001
        if dialect.name == "postgresql":
            from pgvector.sqlalchemy import Vector

            return dialect.type_descriptor(Vector(EMBEDDING_DIM))
        return dialect.type_descriptor(JSON())

    def process_bind_param(self, value: list[float] | None, dialect) -> Any:  # noqa: ANN001
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value
        return value

    def process_result_value(self, value: Any, dialect) -> list[float] | None:  # noqa: ANN001
        if value is None:
            return None
        if dialect.name == "postgresql":
            return list(value)
        return list(value)


class Document(Base):
    __tablename__ = "documentos"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    knowledge_base_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("knowledge_bases.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    titulo: Mapped[str] = mapped_column(String(500), nullable=False)
    palavras_chave: Mapped[str] = mapped_column(Text(), nullable=False, default="")
    resumo: Mapped[str] = mapped_column(Text(), nullable=False, default="")
    arquivo_original: Mapped[str] = mapped_column(String(1024), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    knowledge_base: Mapped[KnowledgeBase | None] = relationship(back_populates="documentos")
    chunks: Mapped[list[DocumentChunk]] = relationship(
        back_populates="documento",
        cascade="all, delete-orphan",
    )


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer(), "sqlite"),
        primary_key=True,
        autoincrement=True,
    )
    documento_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("documentos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index: Mapped[int] = mapped_column(Integer(), nullable=False)
    content: Mapped[str] = mapped_column(Text(), nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(EmbeddingColumn, nullable=True)
    chunk_metadata: Mapped[dict | None] = mapped_column(
        "metadata",
        JSONB().with_variant(JSON(), "sqlite"),
        nullable=True,
    )
    documento: Mapped[Document] = relationship(back_populates="chunks")
