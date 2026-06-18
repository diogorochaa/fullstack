import logging

from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from src.core.config import settings
from src.core.exceptions import MissingConfigurationError
from src.schemas.document import DocumentMetadataDTO

logger = logging.getLogger(__name__)


class DocumentMetadataService:
    def __init__(self) -> None:
        if not settings.OPENAI_API_KEY:
            raise MissingConfigurationError("OPENAI_API_KEY não configurada.")
        self._llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=SecretStr(settings.OPENAI_API_KEY),
            temperature=0.2,
        ).with_structured_output(DocumentMetadataDTO)

    def extract(self, text: str, *, filename: str = "") -> DocumentMetadataDTO:
        truncated = text[: settings.METADATA_EXTRACT_MAX_CHARS]
        prompt = (
            "Analise o documento abaixo e extraia metadados em português.\n"
            f"Nome do arquivo (referência): {filename or 'desconhecido'}\n\n"
            f"---\n{truncated}\n---"
        )
        try:
            result = self._llm.invoke(prompt)
            if isinstance(result, DocumentMetadataDTO):
                return result
            return DocumentMetadataDTO.model_validate(result)
        except Exception:
            logger.exception("Falha na extração de metadados; usando fallback.")
            title = filename.rsplit(".", 1)[0] if filename else "Documento"
            return DocumentMetadataDTO(
                titulo=title,
                palavras_chave=[],
                resumo=truncated[:500],
                topicos=[],
                entidades=[],
            )
