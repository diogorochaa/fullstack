from dataclasses import dataclass

from src.domain.ports import EmbeddingsPort, LLMPort, VectorStorePort


@dataclass(frozen=True)
class AnswerQuestionCommand:
    question: str


@dataclass(frozen=True)
class AnswerQuestionResult:
    response: str


def answer_question_with_rag(
    command: AnswerQuestionCommand,
    llm: LLMPort,
    embeddings: EmbeddingsPort,
    vector_store: VectorStorePort,
) -> AnswerQuestionResult:
    query_embedding = embeddings.embed_query(command.question)
    context_chunks = vector_store.search(query_embedding)
    context = "\n\n".join(context_chunks)

    prompt = f"""
    Responda com base no contexto abaixo:

    {context}

    Pergunta: {command.question}
    """

    response = llm.invoke(prompt)
    return AnswerQuestionResult(response=response.content)
