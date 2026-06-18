from langchain_core.tools import tool

from src.agents.tools.context import ToolRuntimeContext


def build_document_tools(ctx: ToolRuntimeContext) -> list:
    @tool
    def search_documents(query: str) -> str:
        """Busca trechos relevantes na base de conhecimento de documentos PDF."""
        context = ctx.document_service.search_context(query)
        if not context.strip():
            return "Nenhum documento relevante encontrado na base de conhecimento."
        return context

    @tool
    def search_manuals(query: str) -> str:
        """Busca manuais e documentação técnica indexados (mesma base de documentos)."""
        return search_documents.invoke(query)

    @tool
    def get_document_keywords(query: str) -> str:
        """Retorna palavras-chave do documento mais relevante para a consulta."""
        keywords = ctx.document_service.get_keywords_for_query(query)
        if not keywords:
            return "Nenhuma palavra-chave encontrada para esta consulta."
        return keywords

    return [search_documents, search_manuals, get_document_keywords]
