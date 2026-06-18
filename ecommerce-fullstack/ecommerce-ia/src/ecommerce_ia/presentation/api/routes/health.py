from fastapi import APIRouter, Depends

from ecommerce_ia.container import AppContainer
from ecommerce_ia.presentation.api.deps import get_app_container

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "ecommerce-ia"}


@router.get("/status")
async def status(
    container: AppContainer = Depends(get_app_container),
) -> dict[str, object]:
    snapshot = await container.health_status.get_snapshot()
    return {
        "service": snapshot.service,
        "status": snapshot.status,
        "api_reachable": snapshot.api_reachable,
        "api_url": snapshot.api_url,
        "catalog_indexed": snapshot.catalog_indexed,
        "faq_indexed": snapshot.faq_indexed,
        "capabilities": snapshot.capabilities,
    }
