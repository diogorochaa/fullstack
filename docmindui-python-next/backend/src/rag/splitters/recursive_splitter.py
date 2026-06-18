from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.core.config import settings


def split_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.RAG_CHUNK_SIZE,
        chunk_overlap=settings.RAG_CHUNK_OVERLAP,
    )
    return splitter.split_text(text)
