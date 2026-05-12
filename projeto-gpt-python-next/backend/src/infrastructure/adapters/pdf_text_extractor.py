from src.infrastructure.gateways.pdf_service import extract_text_from_pdf


class PdfTextExtractorAdapter:
    def extract(self, file_bytes: bytes) -> str:
        return extract_text_from_pdf(file_bytes)
