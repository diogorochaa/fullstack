import logging

from ecommerce_ia.application.catalog_sync import CatalogSyncService
from ecommerce_ia.domain.ports.catalog import CatalogReader
from ecommerce_ia.infrastructure.vector.chroma_store import ChromaVectorStore
from ecommerce_ia.infrastructure.vector.constants import CATALOG_COLLECTION

logger = logging.getLogger(__name__)


class CatalogReadinessService:
    """Garante conexão com a API e índice local antes do chat."""

    def __init__(
        self,
        catalog: CatalogReader,
        catalog_sync: CatalogSyncService,
        vector_store: ChromaVectorStore,
    ) -> None:
        self._catalog = catalog
        self._catalog_sync = catalog_sync
        self._vector_store = vector_store

    async def ensure_ready(self) -> bool:
        if not await self._catalog.ping():
            logger.warning(
                "Catálogo indisponível — verifique ECOMMERCE_API_URL "
                "(ex.: http://localhost:3000 local ou host.docker.internal no Docker)"
            )
            return False

        indexed = self._vector_store.count(CATALOG_COLLECTION)
        if indexed > 0:
            return True

        try:
            count = await self._catalog_sync.reindex_full()
            logger.info("Catálogo indexado sob demanda (%s produtos)", count)
            return count > 0
        except Exception:
            logger.exception("Falha ao indexar catálogo sob demanda")
            return False
