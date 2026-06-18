from pydantic import BaseModel

from src.schemas.ai import AIRequest


class AgentAskResponse(BaseModel):
    response: str


__all__ = ["AIRequest", "AgentAskResponse"]
