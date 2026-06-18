from functools import lru_cache
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from langchain_openai import ChatOpenAI
from pydantic import SecretStr
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from src.agents.graphs.orchestrator import AgentOrchestrationService
from src.agents.tools.context import ToolRuntimeContext
from src.controllers.agent_controller import AgentController
from src.core.config import settings
from src.database.models.user import User
from src.database.repositories.chunk_repository import DocumentChunkRepository
from src.database.repositories.document_repository import DocumentRepository
from src.database.repositories.knowledge_base_repository import KnowledgeBaseRepository
from src.database.repositories.message_repository import MessageRepository
from src.database.repositories.profile_repository import UserProfileRepository
from src.database.repositories.user_repository import UserRepository
from src.database.session import get_db
from src.rag.embeddings.openai_embeddings import OpenAIEmbeddingsService
from src.services.document.document_service import DocumentService
from src.services.document.metadata_service import DocumentMetadataService
from src.services.knowledge_base.knowledge_base_service import KnowledgeBaseService
from src.services.profile.cep_service import CepLookupService
from src.services.profile.profile_service import UserProfileService
from src.services.user.auth_service import AuthService
from src.services.user.message_service import MessageService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def decode_access_token_subject(token: str) -> UUID:
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    subject = payload.get("sub")
    if not subject:
        raise ValueError("Token sem subject.")
    return UUID(str(subject))


def get_settings():
    return settings


@lru_cache
def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        api_key=SecretStr(settings.OPENAI_API_KEY),
    )


@lru_cache
def get_embeddings_service():
    return OpenAIEmbeddingsService()


@lru_cache
def get_metadata_service():
    return DocumentMetadataService()


@lru_cache
def get_cep_service():
    return CepLookupService()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível autenticar o usuário.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        user_id = decode_access_token_subject(token)
    except (JWTError, ValueError):
        raise credentials_error from None

    user = db.get(User, user_id)
    if user is None:
        raise credentials_error
    return user


def get_current_user_with_messages(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível autenticar o usuário.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        user_id = decode_access_token_subject(token)
    except (JWTError, ValueError):
        raise credentials_error from None

    stmt = select(User).options(selectinload(User.messages)).where(User.id == user_id)
    user = db.execute(stmt).scalar_one_or_none()
    if user is None:
        raise credentials_error
    return user


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db, UserRepository(db))


def get_message_service(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageService:
    return MessageService(db, MessageRepository(db, current_user.id))


def get_document_service(db: Session = Depends(get_db)) -> DocumentService:
    return DocumentService(
        db,
        DocumentRepository(db),
        DocumentChunkRepository(db),
    )


def get_knowledge_base_service(db: Session = Depends(get_db)) -> KnowledgeBaseService:
    doc_repo = DocumentRepository(db)
    return KnowledgeBaseService(
        db,
        KnowledgeBaseRepository(db),
        doc_repo,
        DocumentService(db, doc_repo, DocumentChunkRepository(db)),
    )


def get_profile_service(db: Session = Depends(get_db)) -> UserProfileService:
    return UserProfileService(db, UserProfileRepository(db), UserRepository(db))


def get_agent_service(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentOrchestrationService:
    doc_service = DocumentService(
        db,
        DocumentRepository(db),
        DocumentChunkRepository(db),
        get_embeddings_service(),
    )
    profile_service = UserProfileService(db, UserProfileRepository(db), UserRepository(db))
    ctx = ToolRuntimeContext(
        user_id=current_user.id,
        profile_service=profile_service,
        document_service=doc_service,
    )
    return AgentOrchestrationService(ctx)


def get_agent_controller(
    current_user: User = Depends(get_current_user),
    agent_service: AgentOrchestrationService = Depends(get_agent_service),
) -> AgentController:
    return AgentController(agent_service, current_user.id)
