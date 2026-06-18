import json
import logging
from collections.abc import Callable

import httpx
from langchain_core.tools import tool

from ecommerce_ia.domain.ports.catalog import CatalogReader

logger = logging.getLogger(__name__)


def _format_products(data: dict) -> str:
    products = data.get("data", [])
    if not products:
        return "Nenhum produto encontrado."

    lines = []
    for product in products:
        lines.append(
            f"- {product['name']} | R$ {product['price']} | "
            f"estoque: {product['stock']} | id: {product['id']} | "
            f"link: /products/{product['id']}"
        )
    return "\n".join(lines)


def build_catalog_tools(
    catalog: CatalogReader,
    search_index: Callable[[str, int], str],
) -> list:
    async def _search_products_live(
        search: str,
        category_id: str,
        limit: int,
    ) -> str | None:
        try:
            data = await catalog.list_products(
                search=search,
                category_id=category_id,
                limit=limit,
            )
            formatted = _format_products(data)
            return formatted if formatted != "Nenhum produto encontrado." else None
        except httpx.HTTPError as error:
            logger.warning("Live catalog search failed: %s", error)
            return None

    @tool
    async def search_products(
        search: str = "",
        category_id: str = "",
        limit: int = 5,
    ) -> str:
        """Busca produtos no catálogo por nome, descrição ou categoria."""
        capped_limit = min(limit, 20)
        live_result = await _search_products_live(search, category_id, capped_limit)
        if live_result:
            return live_result

        query = search or category_id or "produtos em destaque"
        indexed_result = search_index(query, capped_limit)
        if (
            indexed_result
            and indexed_result != "Nenhum produto encontrado no índice local."
        ):
            return f"{indexed_result}\n(fonte: índice local do catálogo)"

        return (
            "Não encontrei produtos para essa busca agora. "
            "Tente outro termo ou peça para listar categorias."
        )

    @tool
    async def get_product(product_id: str) -> str:
        """Retorna detalhes de um produto pelo ID."""
        try:
            product = await catalog.get_product(product_id)
        except httpx.HTTPError:
            indexed = search_index(product_id, 1)
            if indexed and "id:" in indexed:
                return indexed
            return "Produto indisponível no momento. Tente novamente em instantes."

        return json.dumps(
            {
                "id": product["id"],
                "name": product["name"],
                "description": product["description"],
                "price": product["price"],
                "stock": product["stock"],
                "categoryId": product["categoryId"],
                "link": f"/products/{product['id']}",
            },
            ensure_ascii=False,
        )

    @tool
    async def list_categories() -> str:
        """Lista categorias disponíveis na loja."""
        try:
            data = await catalog.list_categories()
        except httpx.HTTPError:
            return (
                "Não consegui listar categorias ao vivo. "
                "Use search_products com termos como tênis, roupas ou eletrônicos."
            )

        categories = data.get("data", [])
        if not categories:
            return "Nenhuma categoria encontrada."
        return "\n".join(
            f"- {category['name']} (id: {category['id']}, slug: {category['slug']})"
            for category in categories
        )

    return [search_products, get_product, list_categories]
