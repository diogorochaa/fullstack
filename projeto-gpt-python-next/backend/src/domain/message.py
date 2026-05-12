from dataclasses import dataclass


@dataclass(frozen=True)
class Message:
    conversation_id: str
    role: str
    content: str
    created_at: str
