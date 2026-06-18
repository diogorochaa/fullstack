from typing import Any, Protocol


class CatalogReader(Protocol):
    @property
    def base_url(self) -> str: ...

    async def ping(self) -> bool: ...

    async def list_products(
        self,
        *,
        search: str = "",
        category_id: str = "",
        page: int = 1,
        limit: int = 10,
    ) -> dict[str, Any]: ...

    async def get_product(self, product_id: str) -> dict[str, Any]: ...

    async def list_categories(
        self,
        page: int = 1,
        limit: int = 50,
    ) -> dict[str, Any]: ...
