from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from src.domain.exceptions import (
    DomainError,
    InvalidDocumentError,
    MissingConfigurationError,
    ServiceUnavailableError,
)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(InvalidDocumentError)
    async def handle_invalid_document(_request: Request, exc: InvalidDocumentError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(MissingConfigurationError)
    async def handle_missing_configuration(
        _request: Request, exc: MissingConfigurationError
    ) -> JSONResponse:
        return JSONResponse(status_code=500, content={"detail": str(exc)})

    @app.exception_handler(ServiceUnavailableError)
    async def handle_service_unavailable(
        _request: Request, exc: ServiceUnavailableError
    ) -> JSONResponse:
        return JSONResponse(status_code=503, content={"detail": str(exc)})

    @app.exception_handler(DomainError)
    async def handle_domain_error(_request: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})
