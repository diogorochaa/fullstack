from src.application.use_cases.ingest_document import (
    IngestDocumentCommand,
    ingest_document_text,
)
from src.domain.exceptions import InvalidDocumentError


class FakeEmbeddings:
    def embed_documents(self, chunks: list[str]) -> list[list[float]]:
        return [[float(len(chunk))] for chunk in chunks]


class FakeVectorStore:
    def __init__(self):
        self.added_texts = []
        self.added_embeddings = []

    def add(self, texts: list[str], embeddings: list[list[float]]) -> None:
        self.added_texts = texts
        self.added_embeddings = embeddings


def test_ingest_document_text_indexes_chunks():
    embeddings = FakeEmbeddings()
    vector_store = FakeVectorStore()

    result = ingest_document_text(
        IngestDocumentCommand(text="conteudo relevante"), embeddings, vector_store
    )

    assert vector_store.added_texts
    assert len(vector_store.added_texts) == len(vector_store.added_embeddings)
    assert result.chunks_indexed == len(vector_store.added_texts)


def test_ingest_document_text_rejects_empty_content():
    embeddings = FakeEmbeddings()
    vector_store = FakeVectorStore()

    try:
        ingest_document_text(IngestDocumentCommand(text=""), embeddings, vector_store)
    except InvalidDocumentError as exc:
        assert "sem conteudo" in str(exc)
    else:
        raise AssertionError("InvalidDocumentError era esperado para documento vazio.")
