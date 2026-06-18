import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database.models.document import Document


class DocumentRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add(self, document: Document) -> Document:
        self._db.add(document)
        return document

    def get_by_id(self, document_id: uuid.UUID) -> Document | None:
        return self._db.get(Document, document_id)

    def list_all(self, *, knowledge_base_id: uuid.UUID | None = None) -> list[Document]:
        stmt = select(Document).order_by(Document.created_at.desc())
        if knowledge_base_id is not None:
            stmt = stmt.where(Document.knowledge_base_id == knowledge_base_id)
        return list(self._db.execute(stmt).scalars().all())

    def count(self, *, knowledge_base_id: uuid.UUID | None = None) -> int:
        return len(self.list_all(knowledge_base_id=knowledge_base_id))

    def ids_for_base(self, knowledge_base_id: uuid.UUID | None) -> list[uuid.UUID]:
        docs = self.list_all(knowledge_base_id=knowledge_base_id)
        return [doc.id for doc in docs]

    def search_by_text(self, query: str, *, limit: int = 5) -> list[Document]:
        terms = [t for t in query.lower().split() if len(t) >= 3][:6]
        if not terms:
            return self.list_all()[:limit]
        stmt = select(Document)
        docs = list(self._db.execute(stmt).scalars().all())
        scored: list[tuple[int, Document]] = []
        for doc in docs:
            haystack = " ".join([doc.titulo, doc.palavras_chave, doc.resumo]).lower()
            score = sum(1 for term in terms if term in haystack)
            if score > 0:
                scored.append((score, doc))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [doc for _, doc in scored[:limit]]

    def delete(self, document: Document) -> None:
        self._db.delete(document)
