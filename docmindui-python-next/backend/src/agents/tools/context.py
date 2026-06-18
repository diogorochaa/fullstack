from dataclasses import dataclass
from uuid import UUID

from src.services.document.document_service import DocumentService
from src.services.profile.profile_service import UserProfileService


@dataclass
class ToolRuntimeContext:
    user_id: UUID
    profile_service: UserProfileService
    document_service: DocumentService
    knowledge_base_id: UUID | None = None
    knowledge_base_name: str | None = None
