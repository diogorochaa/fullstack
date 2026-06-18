import logging
import re
from dataclasses import dataclass
from io import BytesIO

from pypdf import PdfReader
from pypdf.errors import PdfReadError, PdfStreamError

from src.core.exceptions import InvalidDocumentError

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class PdfExtractionResult:
    text: str
    pages_total: int
    pages_with_text: int
    chars_extracted: int

    @property
    def text_preview(self) -> str:
        normalized = re.sub(r"\s+", " ", self.text).strip()
        return normalized[:400]


def _extract_page_text(page) -> str:  # noqa: ANN001
    try:
        return page.extract_text(extraction_mode="layout") or ""
    except TypeError:
        return page.extract_text() or ""


def extract_text_from_pdf(file_bytes: bytes) -> PdfExtractionResult:
    if not file_bytes:
        raise InvalidDocumentError("Arquivo PDF vazio.")

    try:
        reader = PdfReader(BytesIO(file_bytes))
    except (PdfReadError, PdfStreamError) as exc:
        raise InvalidDocumentError("PDF inválido ou corrompido.") from exc

    if getattr(reader, "is_encrypted", False):
        try:
            reader.decrypt("")
        except Exception as exc:
            raise InvalidDocumentError(
                "PDF protegido por senha. Envie um arquivo sem criptografia."
            ) from exc

    pages_total = len(reader.pages)
    if pages_total == 0:
        raise InvalidDocumentError("PDF sem páginas.")

    parts: list[str] = []
    pages_with_text = 0
    for index, page in enumerate(reader.pages):
        page_text = _extract_page_text(page).strip()
        if page_text:
            pages_with_text += 1
            parts.append(page_text)
        else:
            logger.warning("pdf_page_empty page=%s/%s", index + 1, pages_total)

    text = "\n\n".join(parts)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    chars_extracted = len(text)

    if chars_extracted < 80:
        raise InvalidDocumentError(
            "Não foi possível extrair texto suficiente do PDF. "
            f"Páginas com texto: {pages_with_text}/{pages_total}. "
            "Se o manual for escaneado (imagem), use um PDF com texto selecionável ou OCR."
        )

    logger.info(
        "pdf_extracted pages_total=%s pages_with_text=%s chars=%s",
        pages_total,
        pages_with_text,
        chars_extracted,
    )
    return PdfExtractionResult(
        text=text,
        pages_total=pages_total,
        pages_with_text=pages_with_text,
        chars_extracted=chars_extracted,
    )
