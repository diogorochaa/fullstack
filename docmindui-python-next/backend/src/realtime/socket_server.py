import logging
from uuid import UUID

import socketio
from jose import JWTError

from src.agents.graphs.orchestrator import AgentOrchestrationService
from src.agents.tools.context import ToolRuntimeContext
from src.controllers.agent_controller import AgentController
from src.core.config import settings
from src.core.dependencies import decode_access_token_subject
from src.database.repositories.chunk_repository import DocumentChunkRepository
from src.database.repositories.document_repository import DocumentRepository
from src.database.repositories.knowledge_base_repository import KnowledgeBaseRepository
from src.database.repositories.profile_repository import UserProfileRepository
from src.database.repositories.user_repository import UserRepository
from src.database.session import SessionLocal
from src.rag.embeddings.openai_embeddings import OpenAIEmbeddingsService
from src.realtime.events import SocketEvents
from src.realtime.schemas import AiAskPayload
from src.schemas.ai import AIRequest
from src.services.document.document_service import DocumentService
from src.services.profile.profile_service import UserProfileService

logger = logging.getLogger(__name__)


def _cors_origins() -> list[str] | str:
    raw = settings.SOCKETIO_CORS_ORIGINS.strip()
    if raw == "*":
        return "*"
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=_cors_origins(),
    logger=False,
    engineio_logger=False,
)


def _build_agent_controller(
    db,  # noqa: ANN001
    user_id: UUID,
    *,
    knowledge_base_id: UUID | None = None,
) -> AgentController:
    embeddings = OpenAIEmbeddingsService()
    base_name: str | None = None
    if knowledge_base_id is not None:
        doc_repo = DocumentRepository(db)
        if doc_repo.count(knowledge_base_id=knowledge_base_id) == 0:
            knowledge_base_id = None
        else:
            base = KnowledgeBaseRepository(db).get_by_id(knowledge_base_id)
            base_name = base.nome if base else None
    doc_service = DocumentService(
        db,
        DocumentRepository(db),
        DocumentChunkRepository(db),
        embeddings,
        knowledge_base_id=knowledge_base_id,
    )
    profile_service = UserProfileService(
        db,
        UserProfileRepository(db),
        UserRepository(db),
    )
    ctx = ToolRuntimeContext(
        user_id=user_id,
        profile_service=profile_service,
        document_service=doc_service,
        knowledge_base_id=knowledge_base_id,
        knowledge_base_name=base_name,
    )
    return AgentController(AgentOrchestrationService(ctx), user_id)


@sio.event
async def connect(sid: str, _environ: dict, auth: dict | None) -> bool:
    if not auth or not auth.get("token"):
        return False
    try:
        user_id = decode_access_token_subject(str(auth["token"]))
    except (ValueError, TypeError, JWTError):
        logger.warning("Socket.IO connect recusado: token inválido (sid=%s)", sid)
        return False

    await sio.save_session(sid, {"user_id": str(user_id)})
    await sio.emit(SocketEvents.CONNECTED, {"ok": True}, to=sid)
    return True


@sio.event
async def disconnect(sid: str) -> None:
    logger.debug("Socket.IO disconnect sid=%s", sid)


@sio.on(SocketEvents.AI_ASK)
async def on_ai_ask(sid: str, data: dict | None) -> None:
    session = await sio.get_session(sid)
    if not session:
        await sio.emit(
            SocketEvents.AI_ERROR,
            {"message": "Sessão não autenticada."},
            to=sid,
        )
        return

    try:
        payload = AiAskPayload.model_validate(data or {})
    except Exception as exc:
        await sio.emit(
            SocketEvents.AI_ERROR,
            {"message": f"Dados inválidos: {exc}"},
            to=sid,
        )
        return

    user_id = UUID(session["user_id"])
    conversation_id = payload.conversation_id
    db = SessionLocal()

    try:
        controller = _build_agent_controller(
            db,
            user_id,
            knowledge_base_id=payload.knowledge_base_id,
        )
        ai_request = AIRequest(
            question=payload.question,
            images=payload.images,
            attachment_context=payload.attachment_context,
            image_base64=payload.image_base64,
            image_media_type=payload.image_media_type,
        )
        for event in controller.stream_ask_events(ai_request):
            if event["type"] == "activity":
                await sio.emit(
                    SocketEvents.AI_ACTIVITY,
                    {
                        "conversation_id": conversation_id,
                        "activity": event["data"],
                    },
                    to=sid,
                )
            elif event["type"] == "chunk":
                await sio.emit(
                    SocketEvents.AI_CHUNK,
                    {"delta": event["data"], "conversation_id": conversation_id},
                    to=sid,
                )
        await sio.emit(
            SocketEvents.AI_DONE,
            {"conversation_id": conversation_id},
            to=sid,
        )
    except Exception:
        logger.exception("Erro no streaming de IA (sid=%s)", sid)
        await sio.emit(
            SocketEvents.AI_ERROR,
            {"message": "Falha ao gerar resposta da IA.", "conversation_id": conversation_id},
            to=sid,
        )
    finally:
        db.close()


def mount_socketio(fastapi_app):  # noqa: ANN001
    return socketio.ASGIApp(
        sio,
        other_asgi_app=fastapi_app,
        socketio_path=settings.SOCKETIO_PATH,
    )
