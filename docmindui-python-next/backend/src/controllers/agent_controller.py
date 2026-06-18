from uuid import UUID

from src.agents.graphs.orchestrator import AgentOrchestrationService
from src.schemas.ai import AIRequest


class AgentController:
    def __init__(self, agent_service: AgentOrchestrationService, user_id: UUID) -> None:
        self._agent = agent_service
        self._user_id = user_id

    def ask(self, request: AIRequest) -> str:
        return self._agent.ask(self._user_id, request)

    def stream_ask(self, request: AIRequest):
        yield from self._agent.stream_ask(self._user_id, request)

    def stream_ask_events(self, request: AIRequest):
        yield from self._agent.stream_ask_events(self._user_id, request)
