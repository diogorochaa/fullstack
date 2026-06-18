import logging

from fastapi import APIRouter, Depends, status

from src.core.dependencies import get_auth_service, get_current_user_with_messages
from src.database.models.user import User
from src.schemas.auth import (
    MeResponse,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from src.schemas.message_response import MessageResponse
from src.services.user.auth_service import AuthService
from src.workers.email_tasks import send_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest, service: AuthService = Depends(get_auth_service)):
    user = service.register(payload.email, payload.password)

    try:
        send_welcome_email.delay(user.email)
    except Exception:
        logger.exception("Falha ao enfileirar e-mail de boas-vindas para %s", user.email)

    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, service: AuthService = Depends(get_auth_service)):
    token = service.login(payload.email, payload.password)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user_with_messages)):
    messages_sorted = sorted(current_user.messages, key=lambda m: (m.created_at, m.id))
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        created_at=current_user.created_at,
        messages=[
            MessageResponse(
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                created_at=m.created_at,
            )
            for m in messages_sorted
        ],
    )
