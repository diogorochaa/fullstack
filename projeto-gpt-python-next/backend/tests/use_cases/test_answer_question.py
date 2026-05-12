from src.application.use_cases.answer_question import (
    AnswerQuestionCommand,
    answer_question_with_rag,
)


class FakeEmbeddings:
    def embed_query(self, query: str) -> list[float]:
        return [0.1, 0.2, float(len(query))]


class FakeVectorStore:
    def __init__(self, chunks: list[str]):
        self.chunks = chunks
        self.last_query = None

    def search(self, query_embedding: list[float], k: int = 3) -> list[str]:
        self.last_query = query_embedding
        return self.chunks[:k]


class FakeResponse:
    def __init__(self, content: str):
        self.content = content


class FakeLLM:
    def __init__(self):
        self.last_prompt = ""

    def invoke(self, prompt: str) -> FakeResponse:
        self.last_prompt = prompt
        return FakeResponse("resposta final")


def test_answer_question_with_rag_uses_context_and_llm():
    llm = FakeLLM()
    embeddings = FakeEmbeddings()
    vector_store = FakeVectorStore(["chunk 1", "chunk 2"])

    result = answer_question_with_rag(
        AnswerQuestionCommand(question="Qual o resumo?"), llm, embeddings, vector_store
    )

    assert result.response == "resposta final"
    assert "chunk 1" in llm.last_prompt
    assert "Qual o resumo?" in llm.last_prompt
    assert vector_store.last_query is not None
