import base64
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from ecommerce_ia.domain.models import ChatResult, ChatSource
from ecommerce_ia.main import app
from ecommerce_ia.presentation.api.deps import get_app_container
from ecommerce_ia.presentation.api.routes.chat import MAX_IMAGE_BYTES

TINY_PNG_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


@pytest.mark.asyncio
async def test_chat_endpoint_returns_reply():
    mock_result = ChatResult(
        reply="Temos ótimos produtos para você.",
        session_id="test-session",
        sources=(ChatSource(type="product", id="abc-123"),),
    )
    mock_container = MagicMock()
    mock_container.customer_chat.execute = AsyncMock(return_value=mock_result)
    app.dependency_overrides[get_app_container] = lambda: mock_container

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/chat",
                json={"message": "quero um tênis"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == mock_result.reply
    assert data["session_id"] == mock_result.session_id
    assert data["sources"][0]["id"] == "abc-123"


@pytest.mark.asyncio
async def test_chat_endpoint_accepts_image_only():
    mock_result = ChatResult(
        reply="Encontrei produtos parecidos.",
        session_id="image-session",
        sources=(ChatSource(type="product", id="prod-1"),),
    )
    mock_container = MagicMock()
    mock_execute = AsyncMock(return_value=mock_result)
    mock_container.customer_chat.execute = mock_execute
    app.dependency_overrides[get_app_container] = lambda: mock_container

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/chat",
                json={
                    "image": {
                        "data": TINY_PNG_BASE64,
                        "mime_type": "image/png",
                    }
                },
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    mock_execute.assert_awaited_once()
    call_kwargs = mock_execute.await_args.kwargs
    assert call_kwargs["image"] is not None
    assert call_kwargs["image"].mime_type == "image/png"
    assert call_kwargs["user_display"] is None


@pytest.mark.asyncio
async def test_chat_endpoint_requires_message_or_image():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/chat", json={})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_endpoint_rejects_invalid_mime_type():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={
                "image": {
                    "data": TINY_PNG_BASE64,
                    "mime_type": "image/gif",
                }
            },
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_endpoint_rejects_oversized_image():
    oversized = base64.b64encode(b"x" * (MAX_IMAGE_BYTES + 1)).decode()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/chat",
            json={
                "image": {
                    "data": oversized,
                    "mime_type": "image/png",
                }
            },
        )

    assert response.status_code == 422
