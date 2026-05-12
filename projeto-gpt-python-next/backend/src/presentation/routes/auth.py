import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.core.security import create_access_token, hash_password, verify_password
from src.infrastructure.database.models import User
from src.infrastructure.database.session import get_db
from src.presentation.schemas.user_schema import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from src.workers.email_tasks import send_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    user = User(email=payload.email.lower(), hashed_password=hash_password(payload.password))
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este e-mail ja esta cadastrado.",
        ) from None

    try:
        send_welcome_email(user.email)
    except Exception:
        logger.exception("Falha ao enviar e-mail de boas-vindas para %s", user.email)

    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email.lower())
    user = db.execute(stmt).scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha invalidos.",
        )
    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)
