import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.core.exceptions import DomainError
from src.database.models.knowledge_base import KnowledgeBase
from src.database.repositories.document_repository import DocumentRepository
from src.database.repositories.knowledge_base_repository import KnowledgeBaseRepository
from src.schemas.knowledge_base import (
    KnowledgeBaseCreate,
    KnowledgeBaseResponse,
    KnowledgeBaseUpdate,
)
from src.services.document.document_service import DocumentService
from src.services.knowledge_base.slug import slugify_name


class KnowledgeBaseService:
    def __init__(
        self,
        db: Session,
        bases: KnowledgeBaseRepository,
        documents: DocumentRepository,
        document_service: DocumentService,
    ) -> None:
        self._db = db
        self._bases = bases
        self._documents = documents
        self._document_service = document_service

    def _to_response(self, base: KnowledgeBase) -> KnowledgeBaseResponse:
        return KnowledgeBaseResponse(
            id=base.id,
            nome=base.nome,
            slug=base.slug,
            created_at=base.created_at,
            document_count=self._documents.count(knowledge_base_id=base.id),
        )

    def list_bases(self) -> list[KnowledgeBaseResponse]:
        return [self._to_response(base) for base in self._bases.list_all()]

    def get_base(self, base_id: uuid.UUID) -> KnowledgeBase:
        base = self._bases.get_by_id(base_id)
        if base is None:
            raise DomainError("Base de conhecimento não encontrada.")
        return base

    def resolve_base_id(self, base_id: uuid.UUID | None) -> uuid.UUID | None:
        if base_id is None:
            return None
        self.get_base(base_id)
        return base_id

    def create_base(self, payload: KnowledgeBaseCreate) -> KnowledgeBaseResponse:
        nome = self._normalize_nome(payload.nome)
        if self._bases.get_by_nome(nome):
            raise DomainError("Já existe uma base com este nome.")

        base_slug = slugify_name(nome)
        if not base_slug:
            raise DomainError("Nome inválido para gerar identificador da base.")

        slug = self._allocate_unique_slug(base_slug)
        base = KnowledgeBase(id=uuid.uuid4(), nome=nome, slug=slug)

        try:
            self._bases.add(base)
            self._db.commit()
            self._db.refresh(base)
        except IntegrityError as exc:
            self._db.rollback()
            raise DomainError("Já existe uma base com este nome ou identificador.") from exc

        return self._to_response(base)

    def update_base(
        self, base_id: uuid.UUID, payload: KnowledgeBaseUpdate
    ) -> KnowledgeBaseResponse:
        base = self.get_base(base_id)
        nome = self._normalize_nome(payload.nome)

        if base.nome == nome:
            return self._to_response(base)

        if self._bases.get_by_nome_excluding(nome, base_id):
            raise DomainError("Já existe uma base com este nome.")

        base_slug = slugify_name(nome)
        if not base_slug:
            raise DomainError("Nome inválido para gerar identificador da base.")

        base.nome = nome
        base.slug = self._allocate_unique_slug(base_slug, exclude_id=base_id)

        try:
            self._db.commit()
            self._db.refresh(base)
        except IntegrityError as exc:
            self._db.rollback()
            raise DomainError("Já existe uma base com este nome ou identificador.") from exc

        return self._to_response(base)

    def delete_base(self, base_id: uuid.UUID) -> None:
        base = self.get_base(base_id)
        self._document_service.delete_documents_for_base(base_id)
        self._bases.delete(base)
        self._db.commit()

    def _normalize_nome(self, nome: str) -> str:
        text = nome.strip()
        if not text:
            raise DomainError("Informe um nome para a base de conhecimento.")
        return text

    def _allocate_unique_slug(self, base_slug: str, *, exclude_id: uuid.UUID | None = None) -> str:
        slug = base_slug
        suffix = 2
        while True:
            existing = self._bases.get_by_slug(slug)
            if existing is None or (exclude_id is not None and existing.id == exclude_id):
                return slug
            tail = f"-{suffix}"
            slug = f"{base_slug[: max(1, 200 - len(tail))]}{tail}"
            suffix += 1
