import contextlib
import logging
import re

import chromadb
from langchain_chroma import Chroma
from langchain_core.documents import Document

from ecommerce_ia.config.settings import Settings
from ecommerce_ia.infrastructure.llm.openai_client import OpenAIEmbeddingFactory
from ecommerce_ia.infrastructure.vector.constants import (
    CATALOG_COLLECTION,
    FAQ_COLLECTION,
)

logger = logging.getLogger(__name__)

_PRICE_RE = re.compile(r"Preço:\s*R\$\s*([\d.]+)")
_STOCK_RE = re.compile(r"Estoque:\s*(\d+)")


class ChromaVectorStore:
    """Adapter Chroma para índices FAQ e catálogo."""

    def __init__(self, settings: Settings, embeddings: OpenAIEmbeddingFactory) -> None:
        self._settings = settings
        self._embeddings = embeddings

    def _ensure_path(self) -> None:
        self._settings.chroma_path.mkdir(parents=True, exist_ok=True)

    def _delete_collection(self, name: str) -> None:
        self._ensure_path()
        client = chromadb.PersistentClient(path=str(self._settings.chroma_path))
        with contextlib.suppress(Exception):
            client.delete_collection(name)

    def get_store(self, collection_name: str) -> Chroma:
        self._ensure_path()
        return Chroma(
            collection_name=collection_name,
            embedding_function=self._embeddings.create(),
            persist_directory=str(self._settings.chroma_path),
        )

    def load_faq_documents(self) -> list[Document]:
        documents: list[Document] = []
        faq_dir = self._settings.faq_path
        if not faq_dir.exists():
            return documents

        for file_path in sorted(faq_dir.glob("*.md")):
            content = file_path.read_text(encoding="utf-8")
            documents.append(
                Document(
                    page_content=content,
                    metadata={"source": file_path.name, "type": "faq"},
                )
            )
        return documents

    def index_faq(self) -> int:
        documents = self.load_faq_documents()
        if not documents:
            return 0

        self._delete_collection(FAQ_COLLECTION)
        Chroma.from_documents(
            documents=documents,
            embedding=self._embeddings.create(),
            collection_name=FAQ_COLLECTION,
            persist_directory=str(self._settings.chroma_path),
        )
        return len(documents)

    def index_catalog(self, documents: list[Document]) -> int:
        if not documents:
            return 0

        self._delete_collection(CATALOG_COLLECTION)
        Chroma.from_documents(
            documents=documents,
            embedding=self._embeddings.create(),
            collection_name=CATALOG_COLLECTION,
            persist_directory=str(self._settings.chroma_path),
        )
        return len(documents)

    def upsert_product(self, product_id: str, document: Document) -> None:
        self.remove_product(product_id)
        store = self.get_store(CATALOG_COLLECTION)
        store.add_documents([document], ids=[product_id])

    def remove_product(self, product_id: str) -> None:
        self._ensure_path()
        client = chromadb.PersistentClient(path=str(self._settings.chroma_path))
        with contextlib.suppress(Exception):
            collection = client.get_collection(CATALOG_COLLECTION)
            collection.delete(where={"product_id": product_id})

    def count(self, collection_name: str) -> int:
        try:
            store = self.get_store(collection_name)
            return int(store._collection.count())  # noqa: SLF001
        except Exception:
            return 0

    def search_catalog(self, query: str, *, limit: int = 5) -> str:
        try:
            store = self.get_store(CATALOG_COLLECTION)
            results = store.similarity_search(query, k=limit)
        except Exception as error:
            logger.warning("Catalog index search failed: %s", error)
            return ""

        if not results:
            return "Nenhum produto encontrado no índice local."

        return "\n".join(self._format_document(doc) for doc in results)

    @staticmethod
    def _format_document(doc: Document) -> str:
        product_id = str(doc.metadata.get("product_id", ""))
        name = str(doc.metadata.get("name", "Produto"))
        price_match = _PRICE_RE.search(doc.page_content)
        stock_match = _STOCK_RE.search(doc.page_content)
        price = price_match.group(1) if price_match else "—"
        stock = stock_match.group(1) if stock_match else "—"
        return (
            f"- {name} | R$ {price} | estoque: {stock} | "
            f"id: {product_id} | link: /products/{product_id}"
        )
