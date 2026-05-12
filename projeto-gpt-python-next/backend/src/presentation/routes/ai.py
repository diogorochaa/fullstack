from fastapi import APIRouter, Depends

from src.application.use_cases.answer_question import (
    AnswerQuestionCommand,
    answer_question_with_rag,
)
from src.core.dependencies import (
    get_embeddings_adapter,
    get_llm,
    get_vector_store,
)
from src.presentation.schemas.ai_schema import AIRequest

router = APIRouter(prefix="/ai")


@router.post("")
def ask(
    data: AIRequest,
    llm=Depends(get_llm),
    embeddings=Depends(get_embeddings_adapter),
    vector_store=Depends(get_vector_store),
):
    result = answer_question_with_rag(
        AnswerQuestionCommand(question=data.question), llm, embeddings, vector_store
    )
    return {"response": result.response}
