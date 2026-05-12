from dataclasses import dataclass

from src.domain.message import Message
from src.domain.ports import MessageHistoryPort


@dataclass(frozen=True)
class CreateMessageCommand:
    conversation_id: str
    role: str
    content: str


def create_message(command: CreateMessageCommand, history: MessageHistoryPort) -> Message:
    message = Message(
        conversation_id=command.conversation_id,
        role=command.role,
        content=command.content,
        created_at="",
    )
    history.add(message)
    return history.list()[-1]


def list_messages(history: MessageHistoryPort) -> list[Message]:
    return history.list()


def clear_messages(history: MessageHistoryPort) -> None:
    history.clear()
