from unittest.mock import AsyncMock, MagicMock

import pytest
from langchain_core.messages import AIMessage

from ecommerce_ia.infrastructure.llm.admin_analyst import OpenAIAdminAnalyst
from ecommerce_ia.infrastructure.llm.openai_client import OpenAIChatModelFactory


@pytest.mark.asyncio
async def test_openai_admin_analyst_uses_model_reply():
    mock_model = MagicMock()
    mock_model.ainvoke = AsyncMock(
        return_value=AIMessage(content="### Resumo\nReceita de R$ 100.")
    )
    mock_factory = MagicMock(spec=OpenAIChatModelFactory)
    mock_factory.create.return_value = mock_model

    analyst = OpenAIAdminAnalyst(mock_factory)
    result = await analyst.analyze(
        "Resuma o mês",
        {"totalRevenue": 100, "totalOrders": 2},
    )

    assert "Resumo" in result.reply
    assert result.sources == ()
    mock_model.ainvoke.assert_awaited_once()
