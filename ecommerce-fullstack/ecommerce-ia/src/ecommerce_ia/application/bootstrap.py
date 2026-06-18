import contextlib
import logging

from ecommerce_ia.application.catalog_sync import CatalogSyncService
from ecommerce_ia.application.faq_indexing import FaqIndexingService
from ecommerce_ia.domain.ports.catalog import CatalogReader
from ecommerce_ia.infrastructure.messaging.consumers import MessagingConsumers

logger = logging.getLogger(__name__)


class BootstrapService:
    """Orquestra inicialização do serviço (índices + consumers)."""

    def __init__(
        self,
        catalog: CatalogReader,
        faq_indexing: FaqIndexingService,
        catalog_sync: CatalogSyncService,
        messaging: MessagingConsumers,
    ) -> None:
        self._catalog = catalog
        self._faq_indexing = faq_indexing
        self._catalog_sync = catalog_sync
        self._messaging = messaging

    async def startup(self) -> None:
        with contextlib.suppress(Exception):
            faq_count = self._faq_indexing.index()
            logger.info("FAQ index ready (%s docs)", faq_count)

        if await self._catalog.ping():
            with contextlib.suppress(Exception):
                catalog_count = await self._catalog_sync.reindex_full()
                logger.info("Catalog index ready (%s products)", catalog_count)
        else:
            logger.warning(
                "Ecommerce API unreachable at startup — catalog tools will use "
                "local index when available. Check ECOMMERCE_API_URL."
            )

        with contextlib.suppress(Exception):
            await self._messaging.start()

    async def shutdown(self) -> None:
        with contextlib.suppress(Exception):
            await self._messaging.stop()
