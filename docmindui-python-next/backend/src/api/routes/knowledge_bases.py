from uuid import UUID

from fastapi import APIRouter, Depends, status

from src.core.dependencies import get_current_user, get_knowledge_base_service
from src.database.models.user import User
from src.schemas.knowledge_base import (
    KnowledgeBaseCreate,
    KnowledgeBaseResponse,
    KnowledgeBaseUpdate,
)
from src.services.knowledge_base.knowledge_base_service import KnowledgeBaseService

router = APIRouter(prefix="/knowledge-bases", tags=["knowledge-bases"])


@router.get("/", response_model=list[KnowledgeBaseResponse])
def list_knowledge_bases(
    _: User = Depends(get_current_user),
    service: KnowledgeBaseService = Depends(get_knowledge_base_service),
) -> list[KnowledgeBaseResponse]:
    return service.list_bases()


@router.post(
    "/",
    response_model=KnowledgeBaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_knowledge_base(
    payload: KnowledgeBaseCreate,
    _: User = Depends(get_current_user),
    service: KnowledgeBaseService = Depends(get_knowledge_base_service),
) -> KnowledgeBaseResponse:
    return service.create_base(payload)


@router.patch("/{base_id}", response_model=KnowledgeBaseResponse)
def update_knowledge_base(
    base_id: UUID,
    payload: KnowledgeBaseUpdate,
    _: User = Depends(get_current_user),
    service: KnowledgeBaseService = Depends(get_knowledge_base_service),
) -> KnowledgeBaseResponse:
    return service.update_base(base_id, payload)


@router.delete("/{base_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_base(
    base_id: UUID,
    _: User = Depends(get_current_user),
    service: KnowledgeBaseService = Depends(get_knowledge_base_service),
) -> None:
    service.delete_base(base_id)
