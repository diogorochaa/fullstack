from ecommerce_ia.domain.models import HealthSnapshot
from ecommerce_ia.domain.ports.catalog import CatalogReader
from ecommerce_ia.infrastructure.vector.chroma_store import ChromaVectorStore
from ecommerce_ia.infrastructure.vector.constants import (
    CATALOG_COLLECTION,
    FAQ_COLLECTION,
)


class HealthStatusService:
    def __init__(
        self,
        catalog: CatalogReader,
        vector_store: ChromaVectorStore,
    ) -> None:
        self._catalog = catalog
        self._vector_store = vector_store

    async def get_snapshot(self) -> HealthSnapshot:
        if hasattr(self._catalog, "resolve_base_url"):
            await self._catalog.resolve_base_url(force=True)
        api_reachable = await self._catalog.ping()
        catalog_indexed = self._vector_store.count(CATALOG_COLLECTION)
        faq_indexed = self._vector_store.count(FAQ_COLLECTION)
        ready = api_reachable or catalog_indexed > 0

        return HealthSnapshot(
            service="ecommerce-ia",
            status="ready" if ready else "degraded",
            api_reachable=api_reachable,
            api_url=self._catalog.base_url,
            catalog_indexed=catalog_indexed,
            faq_indexed=faq_indexed,
            capabilities={
                "product_search": api_reachable or catalog_indexed > 0,
                "faq_answers": faq_indexed > 0,
                "live_catalog": api_reachable,
                "indexed_catalog": catalog_indexed > 0,
                "admin_analysis": True,
                "image_search": True,
            },
        )
