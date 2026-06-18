from langchain_core.tools import tool

from src.agents.tools.context import ToolRuntimeContext
from src.core.exceptions import DomainError


def build_user_tools(ctx: ToolRuntimeContext) -> list:
    @tool
    def get_user_email() -> str:
        """Retorna o e-mail do usuário autenticado."""
        try:
            return ctx.profile_service.get_email(ctx.user_id)
        except DomainError as exc:
            return f"ERRO: {exc}"

    @tool
    def get_user_phone() -> str:
        """Retorna o telefone do usuário autenticado."""
        try:
            return ctx.profile_service.get_phone(ctx.user_id)
        except DomainError as exc:
            return f"ERRO: {exc}"

    @tool
    def get_user_address() -> str:
        """Retorna o endereço completo do usuário autenticado."""
        try:
            return ctx.profile_service.get_address(ctx.user_id)
        except DomainError as exc:
            return f"ERRO: {exc}"

    return [get_user_email, get_user_phone, get_user_address]
