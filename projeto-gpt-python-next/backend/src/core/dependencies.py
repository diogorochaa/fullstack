from functools import lru_cache
from uuid import UUID

from langchain_openai import ChatOpenAI
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from src.core.config import settings
from src.infrastructure.adapters.faiss_vector_store_adapter import (
    FaissVectorStoreAdapter,
)
from src.infrastructure.adapters.openai_embeddings_adapter import (
    OpenAIEmbeddingsAdapter,
)
from src.infrastructure.adapters.pdf_text_extractor import (
    PdfTextExtractorAdapter,
)
from src.infrastructure.gateways.postgres_message_history import (
    PostgresMessageHistoryGateway,
)
from src.infrastructure.database.models import User
from src.infrastructure.database.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_settings():
    return settings


@lru_cache
def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.OPENAI_API_KEY,
    )


@lru_cache
def get_embeddings_adapter():
    return OpenAIEmbeddingsAdapter()


@lru_cache
def get_vector_store():
    return FaissVectorStoreAdapter()


@lru_cache
def get_pdf_text_extractor():
    return PdfTextExtractorAdapter()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nao foi possivel autenticar o usuario.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        subject = payload.get("sub")
        if not subject:
            raise credentials_error
        user_id = UUID(subject)
    except (JWTError, ValueError):
        raise credentials_error from None

    user = db.get(User, user_id)
    if user is None:
        raise credentials_error
    return user


def get_message_history(current_user: User = Depends(get_current_user)):
    return PostgresMessageHistoryGateway(settings.DATABASE_URL, current_user.id)
