from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from src.schemas.message_response import MessageResponse


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime
    messages: list[MessageResponse]
