from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ProfileUpdateRequest(BaseModel):
    nome: str | None = None
    email: str | None = None
    telefone: str | None = None
    cep: str | None = None
    rua: str | None = None
    numero: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    estado: str | None = None


class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    nome: str | None
    email: str | None
    telefone: str | None
    cep: str | None
    rua: str | None
    numero: str | None
    bairro: str | None
    cidade: str | None
    estado: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CepLookupResponse(BaseModel):
    cep: str
    rua: str
    bairro: str
    cidade: str
    estado: str
