from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class KnowledgeBaseCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)


class KnowledgeBaseUpdate(BaseModel):
    nome: str = Field(min_length=1, max_length=200)


class KnowledgeBaseResponse(BaseModel):
    id: UUID
    nome: str
    slug: str
    document_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
