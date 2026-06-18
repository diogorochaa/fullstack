import base64
import binascii
import logging
from typing import Literal

import httpx
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAIError
from pydantic import BaseModel, Field, field_validator, model_validator

from ecommerce_ia.container import AppContainer
from ecommerce_ia.domain.models import ChatImage
from ecommerce_ia.infrastructure.observability.metrics import chat_requests_total
from ecommerce_ia.presentation.api.deps import get_app_container, require_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

MAX_IMAGE_BYTES = 5 * 1024 * 1024
DEFAULT_IMAGE_MESSAGE = "Encontre produtos parecidos com esta imagem."


class ChatSource(BaseModel):
    type: str
    id: str


class ChatImagePayload(BaseModel):
    data: str = Field(min_length=1)
    mime_type: Literal["image/jpeg", "image/png", "image/webp"]

    @field_validator("data")
    @classmethod
    def validate_base64(cls, value: str) -> str:
        try:
            decoded = base64.b64decode(value, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise ValueError("Imagem inválida: dados base64 corrompidos.") from exc
        if len(decoded) > MAX_IMAGE_BYTES:
            max_mb = MAX_IMAGE_BYTES // (1024 * 1024)
            raise ValueError(f"Imagem muito grande. Tamanho máximo: {max_mb} MB.")
        return value


class ChatRequest(BaseModel):
    message: str | None = Field(default=None, max_length=2000)
    session_id: str | None = Field(default=None, max_length=128)
    image: ChatImagePayload | None = None

    @model_validator(mode="after")
    def validate_message_or_image(self) -> "ChatRequest":
        has_message = self.message is not None and self.message.strip() != ""
        if not has_message and self.image is None:
            raise ValueError("Informe uma mensagem ou uma imagem.")
        return self


class AdminChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str | None = Field(default=None, max_length=128)
    context: dict = Field(default_factory=dict)


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    sources: list[ChatSource] = Field(default_factory=list)


def _resolve_message(payload: ChatRequest) -> str:
    if payload.message and payload.message.strip():
        return payload.message.strip()
    return DEFAULT_IMAGE_MESSAGE


def _to_chat_image(payload: ChatImagePayload | None) -> ChatImage | None:
    if payload is None:
        return None
    return ChatImage(data=payload.data, mime_type=payload.mime_type)


def _to_response(result) -> ChatResponse:
    return ChatResponse(
        reply=result.reply,
        session_id=result.session_id,
        sources=[
            ChatSource(type=source.type, id=source.id) for source in result.sources
        ],
    )


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    container: AppContainer = Depends(get_app_container),
) -> ChatResponse:
    user_display = payload.message.strip() if payload.message else None
    message = _resolve_message(payload)
    image = _to_chat_image(payload.image)
    chat_requests_total.labels(type="image" if image else "text").inc()

    try:
        result = await container.customer_chat.execute(
            message,
            payload.session_id,
            image=image,
            user_display=user_display,
        )
    except OpenAIError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Assistente indisponível: configure OPENAI_API_KEY no serviço de IA."
            ),
        ) from None
    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Assistente indisponível: não foi possível consultar o catálogo. "
                "Verifique se a API da loja está rodando."
            ),
        ) from None
    except Exception:
        logger.exception("chat request failed")
        raise HTTPException(
            status_code=503,
            detail=(
                "Assistente temporariamente indisponível. Tente novamente em instantes."
            ),
        ) from None

    return _to_response(result)


@router.post("/admin", response_model=ChatResponse)
async def admin_chat(
    payload: AdminChatRequest,
    container: AppContainer = Depends(get_app_container),
    _admin: dict = Depends(require_admin),
) -> ChatResponse:
    try:
        result = await container.admin_analysis.execute(
            payload.message,
            payload.context,
            payload.session_id,
        )
    except OpenAIError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Assistente indisponível: configure OPENAI_API_KEY no serviço de IA."
            ),
        ) from None
    except Exception:
        logger.exception("admin chat request failed")
        raise HTTPException(
            status_code=503,
            detail=(
                "Assistente temporariamente indisponível. Tente novamente em instantes."
            ),
        ) from None

    return _to_response(result)
