from fastapi import APIRouter, Depends

from src.controllers.agent_controller import AgentController
from src.core.dependencies import get_agent_controller
from src.schemas.agent import AgentAskResponse
from src.schemas.ai import AIRequest

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/ask", response_model=AgentAskResponse)
def ask_agent(
    data: AIRequest,
    controller: AgentController = Depends(get_agent_controller),
):
    return AgentAskResponse(response=controller.ask(data))
