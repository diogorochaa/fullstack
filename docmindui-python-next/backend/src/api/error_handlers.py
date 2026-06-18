from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from src.core.exceptions import (
    CepNotFoundError,
    DocumentNotFoundError,
    DomainError,
    EmailAlreadyInUseError,
    InvalidCredentialsError,
    InvalidDocumentError,
    MissingConfigurationError,
    ProfileFieldMissingError,
    ProfileNotFoundError,
    ServiceUnavailableError,
)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(InvalidDocumentError)
    async def handle_invalid_document(_request: Request, exc: InvalidDocumentError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(DocumentNotFoundError)
    async def handle_document_not_found(
        _request: Request, exc: DocumentNotFoundError
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ProfileNotFoundError)
    async def handle_profile_not_found(
        _request: Request, exc: ProfileNotFoundError
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ProfileFieldMissingError)
    async def handle_profile_field_missing(
        _request: Request, exc: ProfileFieldMissingError
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(CepNotFoundError)
    async def handle_cep_not_found(_request: Request, exc: CepNotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

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

    @app.exception_handler(EmailAlreadyInUseError)
    async def handle_email_in_use(_request: Request, exc: EmailAlreadyInUseError) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(InvalidCredentialsError)
    async def handle_invalid_credentials(
        _request: Request, exc: InvalidCredentialsError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=401,
            content={"detail": str(exc)},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(DomainError)
    async def handle_domain_error(_request: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})
