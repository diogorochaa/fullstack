from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from ecommerce_ia.domain.models import HealthSnapshot
from ecommerce_ia.main import app
from ecommerce_ia.presentation.api.deps import get_app_container

client = TestClient(app)


def test_status_endpoint_reports_capabilities():
    snapshot = HealthSnapshot(
        service="ecommerce-ia",
        status="ready",
        api_reachable=True,
        api_url="http://localhost:3000",
        catalog_indexed=12,
        faq_indexed=5,
        capabilities={
            "product_search": True,
            "faq_answers": True,
            "live_catalog": True,
            "indexed_catalog": True,
            "admin_analysis": True,
        },
    )
    mock_container = MagicMock()
    mock_container.health_status.get_snapshot = AsyncMock(return_value=snapshot)
    app.dependency_overrides[get_app_container] = lambda: mock_container

    try:
        response = client.get("/status")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "ecommerce-ia"
    assert data["status"] == "ready"
    assert data["capabilities"]["admin_analysis"] is True
    assert data["capabilities"]["product_search"] is True
    assert data["catalog_indexed"] == 12
