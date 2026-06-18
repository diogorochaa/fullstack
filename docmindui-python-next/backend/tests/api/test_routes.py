from datetime import UTC
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from src.controllers.agent_controller import AgentController
from src.core.dependencies import get_agent_controller
from src.main import app


class FakeMessageRepository:
    def __init__(self) -> None:
        self.items = []

    def add(self, message):
        from datetime import datetime

        row = MagicMock()
        row.conversation_id = message.conversation_id
        row.role = message.role
        row.content = message.content
        row.created_at = datetime.now(UTC)
        self.items.append(row)
        return row

    def list(self):
        return self.items

    def clear(self):
        self.items = []


def test_health_route_returns_ok():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_agent_route_returns_response_with_override():
    from src.core.dependencies import get_current_user
    from src.database.models.user import User

    mock_controller = MagicMock(spec=AgentController)
    mock_controller.ask.return_value = "resposta do agente"
    fake_user = User(email="agent@example.com", hashed_password="x")
    app.dependency_overrides[get_agent_controller] = lambda: mock_controller
    app.dependency_overrides[get_current_user] = lambda: fake_user
    client = TestClient(app)

    response = client.post(
        "/agent/ask",
        json={"question": "Qual o resumo?"},
        headers={"Authorization": "Bearer fake"},
    )

    assert response.status_code == 200
    assert response.json()["response"] == "resposta do agente"
    app.dependency_overrides.clear()


def test_documents_upload_requires_auth():
    client = TestClient(app)
    response = client.post(
        "/documents/upload",
        files={"file": ("doc.pdf", b"fake-bytes", "application/pdf")},
    )
    assert response.status_code == 401


def test_auth_register_login_and_duplicate_email():
    client = TestClient(app)

    reg = client.post(
        "/auth/register",
        json={"email": "user@example.com", "password": "senha1234"},
    )
    assert reg.status_code == 201
    assert reg.json()["email"] == "user@example.com"

    dup = client.post(
        "/auth/register",
        json={"email": "user@example.com", "password": "outrasenha12"},
    )
    assert dup.status_code == 409

    bad_login = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "errada"},
    )
    assert bad_login.status_code == 401

    ok = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "senha1234"},
    )
    assert ok.status_code == 200
    assert "access_token" in ok.json()
