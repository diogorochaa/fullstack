class DomainError(Exception):
    """Base exception for application errors."""


class InvalidDocumentError(DomainError):
    """Raised when a document cannot be parsed or indexed."""


class MissingConfigurationError(DomainError):
    """Raised when required runtime configuration is missing."""


class ServiceUnavailableError(DomainError):
    """Raised when an external dependency is unavailable."""


class EmailAlreadyInUseError(DomainError):
    """Raised when registering with an e-mail that already exists."""


class InvalidCredentialsError(DomainError):
    """Raised when login credentials are wrong."""


class DocumentNotFoundError(DomainError):
    """Raised when a document id does not exist."""


class ProfileNotFoundError(DomainError):
    """Raised when user profile is missing for a lookup."""


class ProfileFieldMissingError(DomainError):
    """Raised when a profile field requested by a tool is empty."""


class CepNotFoundError(DomainError):
    """Raised when ViaCEP returns no result for a CEP."""
