from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MessageCreateRequest(BaseModel):
    conversation_id: UUID
    role: str
    content: str


class MessageResponse(BaseModel):
    conversation_id: UUID
    role: str
    content: str
    created_at: datetime | str
