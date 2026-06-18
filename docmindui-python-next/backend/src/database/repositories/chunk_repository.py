import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import delete, func, select, type_coerce
from sqlalchemy.orm import Session

from src.database.models.document import EMBEDDING_DIM, DocumentChunk


class DocumentChunkRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add_chunks(self, chunks: list[DocumentChunk]) -> None:
        self._db.add_all(chunks)

    def delete_by_document(self, documento_id: uuid.UUID) -> None:
        stmt = delete(DocumentChunk).where(DocumentChunk.documento_id == documento_id)
        self._db.execute(stmt)

    def indexing_stats(self, documento_id: uuid.UUID) -> tuple[int, int]:
        total = self._db.scalar(
            select(func.count())
            .select_from(DocumentChunk)
            .where(DocumentChunk.documento_id == documento_id)
        )
        with_embedding = self._db.scalar(
            select(func.count())
            .select_from(DocumentChunk)
            .where(
                DocumentChunk.documento_id == documento_id,
                DocumentChunk.embedding.isnot(None),
            )
        )
        return int(total or 0), int(with_embedding or 0)

    def search_similar(
        self,
        query_embedding: list[float],
        *,
        top_k: int = 5,
        document_ids: list[uuid.UUID] | None = None,
    ) -> list[DocumentChunk]:
        bind = self._db.get_bind()
        if bind.dialect.name == "postgresql":
            embedding_col = type_coerce(
                DocumentChunk.embedding,
                Vector(EMBEDDING_DIM),
            )
            stmt = (
                select(DocumentChunk)
                .where(DocumentChunk.embedding.isnot(None))
                .order_by(embedding_col.cosine_distance(query_embedding))
                .limit(top_k)
            )
            if document_ids:
                stmt = stmt.where(DocumentChunk.documento_id.in_(document_ids))
            return list(self._db.execute(stmt).scalars().all())

        stmt = select(DocumentChunk).where(DocumentChunk.embedding.isnot(None))
        if document_ids:
            stmt = stmt.where(DocumentChunk.documento_id.in_(document_ids))
        all_chunks = list(self._db.execute(stmt).scalars().all())
        if not all_chunks:
            return []

        def cosine(a: list[float], b: list[float]) -> float:
            dot = sum(x * y for x, y in zip(a, b, strict=True))
            na = sum(x * x for x in a) ** 0.5
            nb = sum(x * x for x in b) ** 0.5
            if na == 0 or nb == 0:
                return 0.0
            return dot / (na * nb)

        scored = sorted(
            all_chunks,
            key=lambda c: cosine(query_embedding, c.embedding or []),
            reverse=True,
        )
        return scored[:top_k]

    def search_by_text(
        self,
        query: str,
        *,
        top_k: int = 5,
        document_ids: list[uuid.UUID] | None = None,
    ) -> list[DocumentChunk]:
        terms = [t for t in query.lower().split() if len(t) >= 3][:8]
        if not terms:
            return []
        stmt = select(DocumentChunk)
        if document_ids:
            stmt = stmt.where(DocumentChunk.documento_id.in_(document_ids))
        chunks = list(self._db.execute(stmt).scalars().all())
        scored: list[tuple[int, DocumentChunk]] = []
        for chunk in chunks:
            haystack = (chunk.content or "").lower()
            score = sum(1 for term in terms if term in haystack)
            if score > 0:
                scored.append((score, chunk))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in scored[:top_k]]
