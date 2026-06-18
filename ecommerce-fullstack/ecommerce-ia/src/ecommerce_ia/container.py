from dataclasses import dataclass

from ecommerce_ia.application.admin_analysis import AdminAnalysisUseCase
from ecommerce_ia.application.bootstrap import BootstrapService
from ecommerce_ia.application.catalog_readiness import CatalogReadinessService
from ecommerce_ia.application.catalog_sync import CatalogSyncService
from ecommerce_ia.application.customer_chat import CustomerChatUseCase
from ecommerce_ia.application.faq_indexing import FaqIndexingService
from ecommerce_ia.application.health_status import HealthStatusService
from ecommerce_ia.config.settings import Settings, settings
from ecommerce_ia.infrastructure.auth.jwt_verifier import JwtVerifier
from ecommerce_ia.infrastructure.http.ecommerce_api_client import EcommerceApiClient
from ecommerce_ia.infrastructure.llm.admin_analyst import OpenAIAdminAnalyst
from ecommerce_ia.infrastructure.llm.langgraph_agent import LangGraphShoppingAssistant
from ecommerce_ia.infrastructure.llm.openai_client import (
    OpenAIChatModelFactory,
    OpenAIEmbeddingFactory,
)
from ecommerce_ia.infrastructure.messaging.consumers import MessagingConsumers
from ecommerce_ia.infrastructure.persistence.redis_session_store import (
    RedisSessionStore,
)
from ecommerce_ia.infrastructure.vector.chroma_retriever import ChromaContextRetriever
from ecommerce_ia.infrastructure.vector.chroma_store import ChromaVectorStore


@dataclass(slots=True)
class AppContainer:
    settings: Settings
    catalog: EcommerceApiClient
    vector_store: ChromaVectorStore
    catalog_sync: CatalogSyncService
    faq_indexing: FaqIndexingService
    customer_chat: CustomerChatUseCase
    admin_analysis: AdminAnalysisUseCase
    health_status: HealthStatusService
    bootstrap: BootstrapService
    messaging: MessagingConsumers
    session_store: RedisSessionStore
    jwt_verifier: JwtVerifier


def build_container(app_settings: Settings | None = None) -> AppContainer:
    """Composition root — monta o grafo de dependências do serviço."""
    resolved_settings = app_settings or settings

    catalog = EcommerceApiClient(resolved_settings)
    chat_models = OpenAIChatModelFactory(resolved_settings)
    embeddings = OpenAIEmbeddingFactory(resolved_settings)
    vector_store = ChromaVectorStore(resolved_settings, embeddings)
    retriever = ChromaContextRetriever(vector_store)

    catalog_sync = CatalogSyncService(catalog, vector_store)
    catalog_readiness = CatalogReadinessService(catalog, catalog_sync, vector_store)
    faq_indexing = FaqIndexingService(vector_store)
    shopping_assistant = LangGraphShoppingAssistant(
        chat_models,
        retriever,
        catalog,
        vector_store,
    )
    admin_analyst = OpenAIAdminAnalyst(chat_models)
    session_store = RedisSessionStore(resolved_settings)
    jwt_verifier = JwtVerifier(resolved_settings)

    customer_chat = CustomerChatUseCase(
        shopping_assistant,
        session_store,
        catalog_readiness,
    )
    admin_analysis = AdminAnalysisUseCase(admin_analyst, session_store)
    health_status = HealthStatusService(catalog, vector_store)
    messaging = MessagingConsumers(resolved_settings, catalog_sync)
    bootstrap = BootstrapService(catalog, faq_indexing, catalog_sync, messaging)

    return AppContainer(
        settings=resolved_settings,
        catalog=catalog,
        vector_store=vector_store,
        catalog_sync=catalog_sync,
        faq_indexing=faq_indexing,
        customer_chat=customer_chat,
        admin_analysis=admin_analysis,
        health_status=health_status,
        bootstrap=bootstrap,
        messaging=messaging,
        session_store=session_store,
        jwt_verifier=jwt_verifier,
    )


_container: AppContainer | None = None


def get_container() -> AppContainer:
    global _container
    if _container is None:
        _container = build_container()
    return _container


def set_container(container: AppContainer) -> None:
    global _container
    _container = container
