import json
import logging
import re
from dataclasses import dataclass

import httpx
from langchain_core.messages import HumanMessage, SystemMessage

from ecommerce_ia.domain.models import ChatImage, ChatSource
from ecommerce_ia.domain.ports.catalog import CatalogReader
from ecommerce_ia.infrastructure.llm.openai_client import OpenAIChatModelFactory
from ecommerce_ia.infrastructure.observability.metrics import catalog_search_total

logger = logging.getLogger(__name__)

VISION_SYSTEM_PROMPT = """Você analisa fotos de produtos para busca em e-commerce BR.
Responda SOMENTE com JSON válido:
{"description":"descrição curta","search_terms":["termo1","termo2"]}

Regras:
- search_terms em português, curtos, úteis para busca textual
- inclua tipo (camiseta, tênis...), cor, estilo e categoria
- se houver marca visível, inclua também
- use até 5 termos, do mais específico ao mais genérico
"""

DEFAULT_SEARCH_TERMS = ("produto", "roupas", "acessórios")

PRODUCT_HINTS: dict[str, tuple[str, ...]] = {
    "camiseta": ("camiseta", "camiseta básica", "roupas"),
    "camisa": ("camisa", "roupas"),
    "tênis": ("tênis", "calcados"),
    "tenis": ("tênis", "calcados"),
    "jaqueta": ("jaqueta", "roupas"),
    "bermuda": ("bermuda", "roupas"),
    "calça": ("calça", "roupas"),
    "calca": ("calça", "roupas"),
    "moletom": ("moletom", "roupas"),
}


@dataclass(frozen=True, slots=True)
class ImageMatchBundle:
    description: str
    search_terms: tuple[str, ...]
    catalog_snippet: str
    sources: tuple[ChatSource, ...]

    def build_enriched_message(self, user_message: str) -> str:
        terms = ", ".join(self.search_terms)
        return (
            f"{user_message}\n\n"
            "[Busca automática por imagem]\n"
            f"Descrição visual: {self.description}\n"
            f"Termos buscados no catálogo: {terms}\n\n"
            "Resultados encontrados:\n"
            f"{self.catalog_snippet}\n\n"
            "Responda ao cliente com base APENAS nos resultados acima. "
            "Informe nome, preço, estoque e link /products/{id}. "
            "Se não houver match exato, sugira o mais parecido e seja transparente."
        )


class ImageCatalogMatcher:
    """Analisa imagem com visão e busca produtos no catálogo antes do agente."""

    def __init__(
        self,
        chat_models: OpenAIChatModelFactory,
        catalog: CatalogReader,
        search_index,
    ) -> None:
        self._chat_models = chat_models
        self._catalog = catalog
        self._search_index = search_index

    async def match(self, message: str, image: ChatImage) -> ImageMatchBundle:
        description, search_terms = await self._analyze_image(message, image)
        catalog_snippet, sources = await self._search_catalog(search_terms)
        catalog_search_total.labels(source="image").inc()

        if (
            catalog_snippet.startswith("Nenhum produto")
            and not await self._catalog.ping()
        ):
            catalog_snippet = (
                "Catálogo temporariamente indisponível. "
                "Avise o cliente para tentar novamente em instantes."
            )

        return ImageMatchBundle(
            description=description,
            search_terms=search_terms,
            catalog_snippet=catalog_snippet,
            sources=sources,
        )

    async def _analyze_image(
        self,
        message: str,
        image: ChatImage,
    ) -> tuple[str, tuple[str, ...]]:
        model = self._chat_models.create()
        prompt = (
            message.strip() or "Descreva o produto da imagem para busca no catálogo."
        )

        response = await model.ainvoke(
            [
                SystemMessage(content=VISION_SYSTEM_PROMPT),
                HumanMessage(
                    content=[
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{image.mime_type};base64,{image.data}",
                            },
                        },
                    ]
                ),
            ]
        )

        raw = str(response.content)
        description, terms = self._parse_analysis(raw)
        merged = tuple(dict.fromkeys((*terms, *self._fallback_terms(description))))
        return description, merged or DEFAULT_SEARCH_TERMS

    @staticmethod
    def _parse_analysis(raw: str) -> tuple[str, tuple[str, ...]]:
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if not match:
                return raw.strip() or "Produto na imagem enviada pelo cliente.", ()
            try:
                payload = json.loads(match.group(0))
            except json.JSONDecodeError:
                return raw.strip() or "Produto na imagem enviada pelo cliente.", ()

        description = str(payload.get("description", "")).strip()
        terms_raw = payload.get("search_terms", [])
        terms = tuple(
            dict.fromkeys(
                str(term).strip().lower() for term in terms_raw if str(term).strip()
            )
        )
        if not description:
            description = "Produto na imagem enviada pelo cliente."
        return description, terms[:5]

    @staticmethod
    def _fallback_terms(description: str) -> tuple[str, ...]:
        lowered = description.lower()
        terms: list[str] = []

        for hint, values in PRODUCT_HINTS.items():
            if hint in lowered:
                terms.extend(values)

        for word in re.findall(r"[a-z0-9áéíóúãõç]+", lowered):
            if len(word) >= 4:
                terms.append(word)

        if not terms:
            terms = list(DEFAULT_SEARCH_TERMS)
        return tuple(dict.fromkeys(terms))

    @staticmethod
    def _expand_search_terms(search_terms: tuple[str, ...]) -> tuple[str, ...]:
        expanded: list[str] = []
        for term in search_terms:
            normalized = term.strip().lower()
            if not normalized:
                continue
            expanded.append(normalized)
            for word in normalized.split():
                if len(word) >= 4:
                    expanded.append(word)
        return tuple(dict.fromkeys(expanded))

    async def _search_catalog(
        self,
        search_terms: tuple[str, ...],
    ) -> tuple[str, tuple[ChatSource, ...]]:
        lines: list[str] = []
        sources: list[ChatSource] = []
        seen_ids: set[str] = set()

        for term in self._expand_search_terms(search_terms):
            try:
                data = await self._catalog.list_products(search=term, limit=5)
            except httpx.HTTPError as error:
                logger.warning("Image catalog live search failed (%s): %s", term, error)
                data = {"data": []}

            for product in data.get("data", []):
                product_id = str(product.get("id", "")).strip()
                if not product_id or product_id in seen_ids:
                    continue
                seen_ids.add(product_id)
                lines.append(
                    f"- {product['name']} | R$ {product['price']} | "
                    f"estoque: {product['stock']} | id: {product_id} | "
                    f"link: /products/{product_id} | busca: {term}"
                )
                sources.append(ChatSource(type="product", id=product_id))

            if lines:
                break

        if not lines:
            for term in search_terms:
                indexed = self._search_index(term, 5)
                if (
                    not indexed
                    or indexed == "Nenhum produto encontrado no índice local."
                ):
                    continue
                lines.append(f"[índice local — busca: {term}]\n{indexed}")
                sources.extend(self._extract_sources_from_text(indexed))
                if lines:
                    break

        if not lines:
            return (
                "Nenhum produto encontrado no catálogo para esta imagem.",
                tuple(sources),
            )

        return "\n".join(lines), tuple(self._dedupe_sources(sources))

    @staticmethod
    def _extract_sources_from_text(content: str) -> list[ChatSource]:
        sources: list[ChatSource] = []
        for line in content.splitlines():
            if "id:" not in line:
                continue
            parts = line.split("id:")
            if len(parts) < 2:
                continue
            product_id = parts[1].split("|")[0].strip()
            if product_id:
                sources.append(ChatSource(type="product", id=product_id))
        return sources

    @staticmethod
    def _dedupe_sources(sources: list[ChatSource]) -> list[ChatSource]:
        seen: set[str] = set()
        unique: list[ChatSource] = []
        for source in sources:
            if source.id in seen:
                continue
            seen.add(source.id)
            unique.append(source)
        return unique
