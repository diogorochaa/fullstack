import logging
import re

import httpx

from src.core.exceptions import CepNotFoundError, ServiceUnavailableError
from src.schemas.profile import CepLookupResponse

logger = logging.getLogger(__name__)

VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/"


class CepLookupService:
    def lookup(self, cep: str) -> CepLookupResponse:
        digits = re.sub(r"\D", "", cep)
        if len(digits) != 8:
            raise CepNotFoundError("CEP deve conter 8 dígitos.")

        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(VIACEP_URL.format(cep=digits))
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPError as exc:
            logger.exception("Falha ao consultar ViaCEP cep=%s", digits)
            raise ServiceUnavailableError("Serviço de CEP indisponível.") from exc

        if data.get("erro"):
            raise CepNotFoundError("CEP não encontrado.")

        return CepLookupResponse(
            cep=data.get("cep", digits),
            rua=data.get("logradouro", ""),
            bairro=data.get("bairro", ""),
            cidade=data.get("localidade", ""),
            estado=data.get("uf", ""),
        )
