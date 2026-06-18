from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class Message:
    conversation_id: UUID
    role: str
    content: str
    created_at: str
