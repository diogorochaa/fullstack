from unittest.mock import MagicMock

import pytest

from src.core.exceptions import InvalidDocumentError
from src.schemas.document import DocumentMetadataDTO
from src.services.document.document_service import DocumentService


class FakeEmbeddings:
    def embed_documents(self, chunks: list[str]) -> list[list[float]]:
        return [[0.1] * 10 for _ in chunks]

    def embed_query(self, query: str) -> list[float]:
        return [0.1] * 10


def test_document_indexing_indexes_chunks():
    db = MagicMock()
    doc_repo = MagicMock()
    chunk_repo = MagicMock()
    service = DocumentService(db, doc_repo, chunk_repo, FakeEmbeddings())

    metadata = DocumentMetadataDTO(
        titulo="Manual",
        palavras_chave=["rede"],
        resumo="Resumo",
    )
    document, count = service.index_document(
        file_bytes=b"%PDF",
        filename="manual.pdf",
        text="conteúdo relevante " * 50,
        metadata=metadata,
    )

    assert count >= 1
    doc_repo.add.assert_called_once()
    chunk_repo.add_chunks.assert_called_once()
    db.commit.assert_called_once()


def test_split_rejects_empty_via_service():
    db = MagicMock()
    service = DocumentService(db, MagicMock(), MagicMock(), FakeEmbeddings())
    metadata = DocumentMetadataDTO(titulo="Vazio", palavras_chave=[], resumo="")

    with pytest.raises(InvalidDocumentError):
        service.index_document(
            file_bytes=b"x",
            filename="vazio.pdf",
            text="",
            metadata=metadata,
        )
