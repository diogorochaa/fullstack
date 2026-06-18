from unittest.mock import MagicMock
from uuid import uuid4

from src.agents.graphs.orchestrator import _classify_intent
from src.agents.tools.context import ToolRuntimeContext
from src.agents.tools.user_tools import build_user_tools


class FakeLLM:
    class Response:
        content = "profile"

    def invoke(self, messages):  # noqa: ANN001
        return self.Response()


def test_classify_intent_address_heuristic():
    llm = FakeLLM()
    assert _classify_intent(llm, "Qual é meu endereço?") == "address"


def test_classify_intent_profile_heuristic():
    llm = FakeLLM()
    assert _classify_intent(llm, "Qual é meu email?") == "profile"


def test_classify_intent_general_heuristic():
    llm = FakeLLM()
    assert _classify_intent(llm, "Oi, tudo bem?") == "general"


def test_classify_intent_defaults_to_general():
    class UnknownLLM:
        class Response:
            content = "something unknown"

        def invoke(self, messages):  # noqa: ANN001
            return self.Response()

    assert _classify_intent(UnknownLLM(), "Quais as notícias de hoje no mundo tech?") == "general"


def test_user_tools_return_email():
    profile_service = MagicMock()
    profile_service.get_email.return_value = "user@test.com"
    ctx = ToolRuntimeContext(
        user_id=uuid4(),
        profile_service=profile_service,
        document_service=MagicMock(),
    )
    tools = build_user_tools(ctx)
    email_tool = next(t for t in tools if t.name == "get_user_email")
    result = email_tool.invoke({})
    assert result == "user@test.com"
