class DomainError(Exception):
    """Base exception for domain and application errors."""


class InvalidDocumentError(DomainError):
    """Raised when a document cannot be parsed or indexed."""


class MissingConfigurationError(DomainError):
    """Raised when required runtime configuration is missing."""


class ServiceUnavailableError(DomainError):
    """Raised when an external dependency is unavailable."""
