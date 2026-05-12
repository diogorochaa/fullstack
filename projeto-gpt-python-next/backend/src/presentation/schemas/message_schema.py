from pydantic import BaseModel, Field


class MessageCreateRequest(BaseModel):
    conversation_id: str = Field(min_length=1)
    role: str = Field(default="user")
    content: str = Field(min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    conversation_id: str
    role: str
    content: str
    created_at: str
