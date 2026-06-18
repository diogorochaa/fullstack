from dataclasses import dataclass
from uuid import UUID


@dataclass
class MessageDTO:
    conversation_id: UUID
    role: str
    content: str
    created_at: str = ""
