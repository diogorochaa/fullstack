import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database.models.knowledge_base import KnowledgeBase


class KnowledgeBaseRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_all(self) -> list[KnowledgeBase]:
        stmt = select(KnowledgeBase).order_by(KnowledgeBase.nome.asc())
        return list(self._db.execute(stmt).scalars().all())

    def get_by_id(self, base_id: uuid.UUID) -> KnowledgeBase | None:
        return self._db.get(KnowledgeBase, base_id)

    def get_by_slug(self, slug: str) -> KnowledgeBase | None:
        stmt = select(KnowledgeBase).where(KnowledgeBase.slug == slug)
        return self._db.execute(stmt).scalar_one_or_none()

    def get_by_nome(self, nome: str) -> KnowledgeBase | None:
        stmt = select(KnowledgeBase).where(KnowledgeBase.nome == nome)
        return self._db.execute(stmt).scalar_one_or_none()

    def get_by_nome_excluding(self, nome: str, exclude_id: uuid.UUID) -> KnowledgeBase | None:
        stmt = select(KnowledgeBase).where(
            KnowledgeBase.nome == nome,
            KnowledgeBase.id != exclude_id,
        )
        return self._db.execute(stmt).scalar_one_or_none()

    def add(self, base: KnowledgeBase) -> KnowledgeBase:
        self._db.add(base)
        self._db.flush()
        return base

    def delete(self, base: KnowledgeBase) -> None:
        self._db.delete(base)
