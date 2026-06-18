import logging
from typing import Any

import httpx

from ecommerce_ia.config.settings import Settings

logger = logging.getLogger(__name__)


class EcommerceApiClient:
    """Adapter HTTP para leitura do catálogo da API NestJS."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._configured_url = settings.ecommerce_api_url.rstrip("/")
        self._resolved_url: str | None = None

    @property
    def base_url(self) -> str:
        return self._resolved_url or self._configured_url

    def candidate_urls(self) -> list[str]:
        urls = [self._configured_url]

        host_ip = self._settings.ecommerce_api_host_ip.strip()
        if host_ip:
            urls.append(f"http://{host_ip}:3000")

        urls.extend(self._settings.ecommerce_api_fallback_url_list)

        seen: set[str] = set()
        unique: list[str] = []
        for url in urls:
            normalized = url.rstrip("/")
            if normalized and normalized not in seen:
                seen.add(normalized)
                unique.append(normalized)
        return unique

    async def resolve_base_url(self, *, force: bool = False) -> str | None:
        if self._resolved_url and not force:
            return self._resolved_url

        for url in self.candidate_urls():
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.get(f"{url}/products", params={"limit": 1})
                    response.raise_for_status()
            except httpx.HTTPError as error:
                logger.warning("API candidate unavailable (%s): %s", url, error)
                continue

            self._resolved_url = url
            logger.info("Ecommerce API resolved to %s", url)
            return url

        self._resolved_url = None
        logger.warning(
            "Ecommerce API unreachable — tentou: %s",
            ", ".join(self.candidate_urls()),
        )
        return None

    async def ping(self) -> bool:
        return await self.resolve_base_url() is not None

    async def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        resolved = await self.resolve_base_url()
        if not resolved:
            raise httpx.ConnectError("Ecommerce API unreachable")

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(f"{resolved}{path}", params=params)
            response.raise_for_status()
            return response.json()

    async def list_products(
        self,
        *,
        search: str = "",
        category_id: str = "",
        page: int = 1,
        limit: int = 10,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"page": page, "limit": limit}
        if search:
            params["search"] = search
        if category_id:
            params["categoryId"] = category_id
        return await self._get("/products", params)

    async def get_product(self, product_id: str) -> dict[str, Any]:
        return await self._get(f"/products/{product_id}")

    async def list_categories(
        self,
        page: int = 1,
        limit: int = 50,
    ) -> dict[str, Any]:
        return await self._get("/categories", {"page": page, "limit": limit})
