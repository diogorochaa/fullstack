from typing import Annotated, TypedDict

from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    user_id: str
    question: str
    intent: str
    tool_results: list[dict]
    sources: list[dict]
    context: str
    answer: str
    messages: Annotated[list, add_messages]
    images_context: str
    attachment_context: str
