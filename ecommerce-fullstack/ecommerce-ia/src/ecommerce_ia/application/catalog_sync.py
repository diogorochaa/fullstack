import logging

from ecommerce_ia.domain.ports.catalog import CatalogReader
from ecommerce_ia.infrastructure.vector.chroma_store import ChromaVectorStore
from ecommerce_ia.infrastructure.vector.product_document import product_to_document

logger = logging.getLogger(__name__)


class CatalogSyncService:
    """Orquestra sincronização do catálogo entre API e índice vetorial."""

    def __init__(
        self,
        catalog: CatalogReader,
        vector_store: ChromaVectorStore,
    ) -> None:
        self._catalog = catalog
        self._vector_store = vector_store

    async def fetch_all_products(self) -> list[dict]:
        products: list[dict] = []
        page = 1
        limit = 100

        while True:
            data = await self._catalog.list_products(page=page, limit=limit)
            products.extend(data.get("data", []))
            total_pages = int(data.get("totalPages", 1))
            if page >= total_pages:
                break
            page += 1

        return products

    async def upsert_product(self, product_id: str) -> bool:
        try:
            product = await self._catalog.get_product(product_id)
        except Exception:
            logger.warning("Product %s not found for indexing", product_id)
            await self.remove_product(product_id)
            return False

        if not product.get("active", True):
            await self.remove_product(product_id)
            return False

        self._vector_store.upsert_product(
            product_id,
            product_to_document(product),
        )
        logger.info("Indexed product %s", product_id)
        return True

    async def remove_product(self, product_id: str) -> None:
        self._vector_store.remove_product(product_id)
        logger.info("Removed product %s from catalog index", product_id)

    async def reindex_full(self) -> int:
        products = await self.fetch_all_products()
        documents = [product_to_document(product) for product in products]
        return self._vector_store.index_catalog(documents)
