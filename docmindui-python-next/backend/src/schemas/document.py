from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DocumentMetadataDTO(BaseModel):
    titulo: str = Field(description="Título do documento")
    palavras_chave: list[str] = Field(default_factory=list)
    resumo: str = ""
    topicos: list[str] = Field(default_factory=list)
    entidades: list[str] = Field(default_factory=list)


class DocumentResponse(BaseModel):
    id: UUID
    titulo: str
    palavras_chave: str
    resumo: str
    arquivo_original: str
    knowledge_base_id: UUID | None = None
    knowledge_base_nome: str | None = None
    created_at: datetime
    updated_at: datetime
    status: str = "inativo"
    chunks_count: int = 0
    index_ready: bool = False
    vigencia: datetime | None = None

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    status: str
    document: DocumentResponse
    chunks_indexed: int
    pages_extracted: int = 0
    chars_extracted: int = 0
    text_preview: str = ""
