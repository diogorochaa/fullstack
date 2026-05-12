from fastapi import APIRouter, Depends, status

from src.application.use_cases.message_history import (
    CreateMessageCommand,
    clear_messages,
    create_message,
    list_messages,
)
from src.core.dependencies import get_message_history
from src.presentation.schemas.message_schema import MessageCreateRequest, MessageResponse

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/", response_model=list[MessageResponse])
def get_messages(history=Depends(get_message_history)):
    messages = list_messages(history)
    return [
        MessageResponse(
            conversation_id=message.conversation_id,
            role=message.role,
            content=message.content,
            created_at=message.created_at,
        )
        for message in messages
    ]


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def post_message(
    payload: MessageCreateRequest,
    history=Depends(get_message_history),
):
    message = create_message(
        CreateMessageCommand(
            conversation_id=payload.conversation_id,
            role=payload.role,
            content=payload.content,
        ),
        history,
    )
    return MessageResponse(
        conversation_id=message.conversation_id,
        role=message.role,
        content=message.content,
        created_at=message.created_at,
    )


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_messages(history=Depends(get_message_history)):
    clear_messages(history)
