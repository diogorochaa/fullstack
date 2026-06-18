from pydantic import BaseModel, Field


class KnowledgeSourceDTO(BaseModel):
    document_id: str
    titulo: str
    palavras_chave: str = ""
    snippet: str = ""


class AgentActivityStepDTO(BaseModel):
    phase: str
    label: str
    detail: str | None = None


class AgentActivityDTO(BaseModel):
    intent: str = ""
    steps: list[AgentActivityStepDTO] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    sources: list[KnowledgeSourceDTO] = Field(default_factory=list)
    documents_in_base: int = 0
    knowledge_base_id: str | None = None
    knowledge_base_name: str | None = None
    search_label: str | None = None
    status_message: str | None = None
    reasoning_log: str | None = None
