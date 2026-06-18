from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "DocMind"
    ENV: str = "dev"
    OPENAI_API_KEY: str = ""
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/docmind"

    CELERY_BROKER_URL: str = "amqp://guest:guest@localhost:5672//"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    CELERY_TASK_ALWAYS_EAGER: bool = False
    CELERY_INDEX_DOCUMENTS: bool = Field(
        default=False,
        description="Indexação de PDF no worker Celery; disco deve ser visível na API e no worker.",
    )
    DOCUMENTS_STORAGE_DIR: str = Field(
        default="data/document_uploads",
        description="Diretório para PDFs originais; compartilhar volume entre API e worker Celery.",
    )
    DOCUMENT_MAX_BYTES: int = 20 * 1024 * 1024
    RAG_CHUNK_SIZE: int = 500
    RAG_CHUNK_OVERLAP: int = 50
    RAG_TOP_K: int = 5
    METADATA_EXTRACT_MAX_CHARS: int = 12_000
    CELERY_INDEX_TASK_TIMEOUT_SECONDS: int = 300

    SOCKETIO_PATH: str = "socket.io"
    SOCKETIO_CORS_ORIGINS: str = "*"

    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@localhost"

    model_config = SettingsConfigDict(env_file=".env")

    @field_validator("CELERY_TASK_ALWAYS_EAGER", mode="before")
    @classmethod
    def parse_bool(cls, v: object) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.strip().lower() in ("1", "true", "yes", "on")
        return bool(v)

    @field_validator("CELERY_INDEX_DOCUMENTS", mode="before")
    @classmethod
    def parse_celery_index_documents(cls, v: object) -> bool:
        return cls.parse_bool(v)

    def documents_storage_path(self) -> Path:
        return Path(self.DOCUMENTS_STORAGE_DIR).expanduser().resolve()


settings = Settings()
