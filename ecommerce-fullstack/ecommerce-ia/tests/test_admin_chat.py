from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from ecommerce_ia.domain.models import ChatResult
from ecommerce_ia.main import app
from ecommerce_ia.presentation.api.deps import get_app_container, require_admin


@pytest.mark.asyncio
async def test_admin_chat_endpoint_returns_reply():
    mock_result = ChatResult(
        reply="A receita total da loja é R$ 7.316,10.",
        session_id="admin-session",
        sources=(),
    )
    mock_container = MagicMock()
    mock_container.admin_analysis.execute = AsyncMock(return_value=mock_result)
    app.dependency_overrides[get_app_container] = lambda: mock_container
    app.dependency_overrides[require_admin] = lambda: {
        "role": "ADMIN",
        "sub": "admin-1",
    }

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/chat/admin",
                headers={"Authorization": "Bearer test-token"},
                json={
                    "message": "Resuma as vendas",
                    "context": {"totalRevenue": 7316.1, "totalOrders": 15},
                },
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert "receita" in data["reply"].lower()
    assert data["session_id"] == "admin-session"
    assert data["sources"] == []


@pytest.mark.asyncio
async def test_admin_chat_rejects_empty_message():
    app.dependency_overrides[require_admin] = lambda: {
        "role": "ADMIN",
        "sub": "admin-1",
    }

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/chat/admin",
                headers={"Authorization": "Bearer test-token"},
                json={"message": "", "context": {}},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_admin_chat_requires_auth():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/chat/admin",
            json={"message": "Resuma", "context": {}},
        )

    assert response.status_code == 401
