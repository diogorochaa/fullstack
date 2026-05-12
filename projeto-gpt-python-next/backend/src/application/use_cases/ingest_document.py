from dataclasses import dataclass

from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.domain.exceptions import InvalidDocumentError
from src.domain.ports import EmbeddingsPort, VectorStorePort


@dataclass(frozen=True)
class IngestDocumentCommand:
    text: str


@dataclass(frozen=True)
class IngestDocumentResult:
    chunks_indexed: int


def ingest_document_text(
    command: IngestDocumentCommand,
    embeddings: EmbeddingsPort,
    vector_store: VectorStorePort,
) -> IngestDocumentResult:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(command.text)

    if not chunks:
        raise InvalidDocumentError("Documento sem conteudo para indexacao.")

    vectors = embeddings.embed_documents(chunks)
    vector_store.add(chunks, vectors)
    return IngestDocumentResult(chunks_indexed=len(chunks))
