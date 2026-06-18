import uuid

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from fastapi.responses import FileResponse

from src.controllers.document_controller import DocumentController
from src.core.dependencies import (
    get_current_user,
    get_document_service,
    get_knowledge_base_service,
    get_metadata_service,
)
from src.database.models.user import User
from src.schemas.document import DocumentResponse, DocumentUploadResponse
from src.services.document.document_service import DocumentService
from src.services.document.metadata_service import DocumentMetadataService
from src.services.knowledge_base.knowledge_base_service import KnowledgeBaseService

router = APIRouter(prefix="/documents", tags=["documents"])


def get_document_controller(
    document_service: DocumentService = Depends(get_document_service),
    metadata_service: DocumentMetadataService = Depends(get_metadata_service),
    knowledge_base_service: KnowledgeBaseService = Depends(get_knowledge_base_service),
) -> DocumentController:
    return DocumentController(document_service, metadata_service, knowledge_base_service)


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    knowledge_base_id: uuid.UUID | None = Query(default=None),
    _: User = Depends(get_current_user),
    controller: DocumentController = Depends(get_document_controller),
):
    return await controller.upload(file, knowledge_base_id=knowledge_base_id)


@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    knowledge_base_id: uuid.UUID | None = Query(default=None),
    _: User = Depends(get_current_user),
    controller: DocumentController = Depends(get_document_controller),
):
    return controller.list_documents(knowledge_base_id=knowledge_base_id)


@router.get("/{document_id}/file")
def get_document_file(
    document_id: uuid.UUID,
    _: User = Depends(get_current_user),
    controller: DocumentController = Depends(get_document_controller),
):
    path = controller.get_file_path(document_id)
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=path.name.split("_", 1)[-1] if "_" in path.name else path.name,
    )


@router.post("/{document_id}/reindex", response_model=DocumentResponse)
def reindex_document(
    document_id: uuid.UUID,
    _: User = Depends(get_current_user),
    controller: DocumentController = Depends(get_document_controller),
):
    return controller.reindex(document_id)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: uuid.UUID,
    _: User = Depends(get_current_user),
    controller: DocumentController = Depends(get_document_controller),
):
    controller.delete(document_id)
