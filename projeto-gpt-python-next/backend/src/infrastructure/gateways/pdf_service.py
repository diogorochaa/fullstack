from io import BytesIO

from pypdf import PdfReader
from pypdf.errors import PdfReadError, PdfStreamError

from src.domain.exceptions import InvalidDocumentError


def extract_text_from_pdf(file_bytes: bytes) -> str:
    if not file_bytes:
        raise InvalidDocumentError("Arquivo PDF vazio.")

    try:
        reader = PdfReader(BytesIO(file_bytes))
    except (PdfReadError, PdfStreamError) as exc:
        raise InvalidDocumentError("PDF invalido ou corrompido.") from exc

    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""

    if not text.strip():
        raise InvalidDocumentError("Nao foi possivel extrair texto do PDF.")

    return text
