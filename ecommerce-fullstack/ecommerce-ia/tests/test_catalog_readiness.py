from unittest.mock import AsyncMock, MagicMock

import pytest

from ecommerce_ia.application.catalog_readiness import CatalogReadinessService


@pytest.mark.asyncio
async def test_ensure_ready_reindexes_when_api_is_up_and_index_empty():
    catalog = MagicMock()
    catalog.ping = AsyncMock(return_value=True)

    catalog_sync = MagicMock()
    catalog_sync.reindex_full = AsyncMock(return_value=12)

    vector_store = MagicMock()
    vector_store.count.return_value = 0

    service = CatalogReadinessService(catalog, catalog_sync, vector_store)
    ready = await service.ensure_ready()

    assert ready is True
    catalog_sync.reindex_full.assert_awaited_once()


@pytest.mark.asyncio
async def test_ensure_ready_returns_false_when_api_is_down():
    catalog = MagicMock()
    catalog.ping = AsyncMock(return_value=False)

    service = CatalogReadinessService(
        catalog,
        MagicMock(),
        MagicMock(),
    )

    ready = await service.ensure_ready()

    assert ready is False
