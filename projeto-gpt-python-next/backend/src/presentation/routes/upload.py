from fastapi import APIRouter, Depends, File, UploadFile

from src.application.use_cases.ingest_document import (
    IngestDocumentCommand,
    ingest_document_text,
)
from src.core.dependencies import (
    get_embeddings_adapter,
    get_pdf_text_extractor,
    get_vector_store,
)

router = APIRouter(prefix="/upload")


@router.post("/")
async def upload(
    file: UploadFile = File(...),
    extractor=Depends(get_pdf_text_extractor),
    embeddings=Depends(get_embeddings_adapter),
    vector_store=Depends(get_vector_store),
):
    content = await file.read()
    text = extractor.extract(content)
    result = ingest_document_text(IngestDocumentCommand(text=text), embeddings, vector_store)

    return {"status": "document indexed", "chunks_indexed": result.chunks_indexed}
