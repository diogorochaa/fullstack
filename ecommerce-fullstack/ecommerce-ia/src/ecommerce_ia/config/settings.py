from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_port: int = 8100
    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/ecommerce"
    )
    ecommerce_api_url: str = "http://localhost:3000"
    ecommerce_api_host_ip: str = ""
    ecommerce_api_fallback_urls: str = (
        "http://host.docker.internal:3000,http://172.17.0.1:3000"
    )
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    kafka_brokers: str = "localhost:9092"
    rabbitmq_url: str = "amqp://rabbit:rabbit@localhost:5672"
    redis_url: str = "redis://localhost:6379"
    jwt_secret: str = ""
    chat_session_ttl_seconds: int = 86_400
    chat_max_messages: int = 20
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    chroma_persist_dir: str = ".chroma"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def ecommerce_api_fallback_url_list(self) -> list[str]:
        raw = self.ecommerce_api_fallback_urls
        if not raw.strip():
            return []
        return [url.strip().rstrip("/") for url in raw.split(",") if url.strip()]

    @property
    def chroma_path(self) -> Path:
        path = Path(self.chroma_persist_dir)
        if not path.is_absolute():
            return BASE_DIR / path
        return path

    @property
    def faq_path(self) -> Path:
        return BASE_DIR / "data" / "faq"


settings = Settings()
