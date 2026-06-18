#!/usr/bin/env python3
"""Indexa FAQ e catálogo de produtos no Chroma."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ecommerce_ia.container import build_container
from ecommerce_ia.infrastructure.vector.product_document import product_to_document


async def main() -> None:
    container = build_container()
    faq_count = container.faq_indexing.index()
    products = await container.catalog_sync.fetch_all_products()
    documents = [product_to_document(product) for product in products]
    catalog_count = container.vector_store.index_catalog(documents)

    print(f"FAQ indexado: {faq_count} documentos")
    print(f"Catálogo indexado: {catalog_count} produtos")


if __name__ == "__main__":
    asyncio.run(main())
