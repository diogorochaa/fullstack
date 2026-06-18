import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from ecommerce_ia.domain.models import ChatImage
from ecommerce_ia.infrastructure.llm.image_catalog_matcher import ImageCatalogMatcher


@pytest.mark.asyncio
async def test_match_expands_compound_terms_and_finds_products():
    vision_response = MagicMock()
    vision_response.content = json.dumps(
        {
            "description": "Camiseta branca básica de manga curta",
            "search_terms": ["camiseta branca", "camiseta básica"],
        },
        ensure_ascii=False,
    )
    model = MagicMock()
    model.ainvoke = AsyncMock(return_value=vision_response)

    chat_models = MagicMock()
    chat_models.create.return_value = model

    catalog = MagicMock()
    catalog.list_products = AsyncMock(
        side_effect=lambda **kwargs: (
            {"data": []}
            if kwargs.get("search") == "camiseta branca"
            else {
                "data": [
                    {
                        "id": "prod-camiseta",
                        "name": "Camiseta Básica Premium",
                        "price": 79.9,
                        "stock": 120,
                    }
                ]
            }
        )
    )

    matcher = ImageCatalogMatcher(chat_models, catalog, lambda _q, _l: "")
    bundle = await matcher.match(
        "tem no estoque?",
        ChatImage(data="abc", mime_type="image/png"),
    )

    assert "Camiseta Básica Premium" in bundle.catalog_snippet
    assert bundle.sources[0].id == "prod-camiseta"
    assert "camiseta" in bundle.search_terms or "camiseta branca" in bundle.search_terms
    catalog.list_products.assert_any_call(search="camiseta", limit=5)


def test_parse_analysis_extracts_json_from_markdown_wrapper():
    raw = (
        'Análise:\n{"description":"Tênis preto","search_terms":["tênis","nike"]}'
    )
    description, terms = ImageCatalogMatcher._parse_analysis(raw)

    assert description == "Tênis preto"
    assert terms == ("tênis", "nike")
