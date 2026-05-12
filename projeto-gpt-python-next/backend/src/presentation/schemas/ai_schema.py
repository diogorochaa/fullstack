from pydantic import BaseModel


class AIRequest(BaseModel):
    question: str
