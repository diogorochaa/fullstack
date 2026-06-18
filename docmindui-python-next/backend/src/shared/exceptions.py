from src.core.exceptions import (  # noqa: F401
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

__all__ = [
    "DomainError",
    "InvalidDocumentError",
    "MissingConfigurationError",
    "ServiceUnavailableError",
    "EmailAlreadyInUseError",
    "InvalidCredentialsError",
    "DocumentNotFoundError",
    "ProfileNotFoundError",
    "ProfileFieldMissingError",
    "CepNotFoundError",
]
