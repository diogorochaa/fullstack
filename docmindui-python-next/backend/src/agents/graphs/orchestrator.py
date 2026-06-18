import json
import logging
import time
from typing import Literal
from uuid import UUID

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from pydantic import SecretStr

from src.agents.prompts.orchestrator import (
    ANSWER_GENERAL_PROMPT,
    ANSWER_RAG_EMPTY_PROMPT,
    ANSWER_STRICT_PROMPT,
    ANSWER_USER_TEMPLATE,
    INTENT_CLASSIFIER_PROMPT,
)
from src.agents.state.chat_state import AgentState
from src.agents.tools.context import ToolRuntimeContext
from src.agents.tools.document_tools import build_document_tools
from src.agents.tools.user_tools import build_user_tools
from src.core.config import settings
from src.schemas.agent_activity import AgentActivityDTO, AgentActivityStepDTO, KnowledgeSourceDTO
from src.schemas.ai import AIRequest

logger = logging.getLogger(__name__)

IntentType = Literal["profile", "address", "knowledge", "rag", "general"]

INTENT_LABELS = {
    "profile": "Dados do perfil",
    "address": "Endereço do usuário",
    "knowledge": "Base de conhecimento",
    "rag": "Documentos indexados (RAG)",
    "general": "Conversa geral",
}

DOCUMENT_INTENTS = frozenset({"knowledge", "rag"})

STREAM_CHUNK_SIZE = 32
STREAM_CHUNK_DELAY_SEC = 0.02


def _format_reasoning_log(
    steps: list[AgentActivityStepDTO],
    *,
    base_name: str | None,
    tools: list[str],
    sources: list[KnowledgeSourceDTO],
) -> str:
    lines: list[str] = []
    for index, step in enumerate(steps, start=1):
        lines.append(f"Etapa {index}")
        if step.phase == "classify":
            lines.append("Processando a etapa «router»…")
            lines.append(f"Critério de roteamento: intenção «{step.detail or step.label}».")
        elif step.phase == "search" and base_name:
            keyword_set = {
                term
                for s in sources
                for term in (s.palavras_chave or "").split(",")
                if term.strip()
            }
            keywords = ", ".join(sorted(keyword_set)[:8])
            if keywords:
                lines.append(f"Palavras-chave identificadas: [{keywords}].")
            lines.append(f"Consultando {base_name}")
            lines.append(
                "Andamento: Especialistas identificados. Consultando bases de conhecimento…"
            )
            lines.append(
                f"Sub-roteamento: {base_name} — "
                f"{step.detail or 'busca em documentos indexados (PgVector)'}"
            )
        elif step.phase == "tools":
            lines.append(f"Ferramentas: {', '.join(tools) if tools else 'perfil'}")
            lines.append(step.detail or step.label)
        else:
            lines.append(step.label)
            if step.detail:
                lines.append(step.detail)
        lines.append("")
    return "\n".join(lines).strip()


GENERAL_HINT_WORDS = (
    "oi",
    "olá",
    "ola",
    "bom dia",
    "boa tarde",
    "boa noite",
    "obrigado",
    "obrigada",
    "valeu",
    "tudo bem",
    "como vai",
    "quem é você",
    "o que você faz",
    "ajuda",
    "help",
)

RAG_HINT_WORDS = (
    "manual",
    "documento",
    "pdf",
    "instalação",
    "instalacao",
    "operadora",
    "operadoras",
    "configurar",
    "loja",
    "lojas",
    "rede",
    "franquia",
    "procedimento",
    "manual",
    "política",
    "politica",
)


def _classify_intent(llm: ChatOpenAI, question: str) -> IntentType:
    q = question.lower().strip()
    if any(w in q for w in ("endereço", "endereco", "cep", "rua", "bairro", "cidade", "moro")):
        return "address"
    if any(w in q for w in ("email", "e-mail", "telefone", "celular", "meu nome", "meus dados")):
        return "profile"
    if any(w in q for w in RAG_HINT_WORDS):
        return "rag"
    if len(q) <= 40 and any(h in q for h in GENERAL_HINT_WORDS):
        return "general"
    prompt = INTENT_CLASSIFIER_PROMPT.format(question=question)
    response = llm.invoke([HumanMessage(content=prompt)])
    text = str(response.content).strip().lower()
    for intent in ("profile", "address", "knowledge", "rag", "general"):
        if intent in text:
            return intent  # type: ignore[return-value]
    return "general"


def _rag_search_was_empty(tool_results: list[dict]) -> bool:
    empty_markers = (
        "Nenhum trecho encontrado",
        "Nenhum documento relevante",
        "Nenhuma palavra-chave encontrada",
    )
    if not tool_results:
        return True
    outputs = " ".join(str(item.get("output", "")) for item in tool_results)
    return any(marker in outputs for marker in empty_markers)


def _answer_system_prompt(state: AgentState) -> str:
    intent = str(state.get("intent", "general"))
    sources = state.get("sources") or []
    tool_results = state.get("tool_results") or []

    if intent == "general":
        return ANSWER_GENERAL_PROMPT
    if intent in DOCUMENT_INTENTS:
        if sources or not _rag_search_was_empty(tool_results):
            return ANSWER_STRICT_PROMPT
        return ANSWER_RAG_EMPTY_PROMPT
    return ANSWER_STRICT_PROMPT


def _collect_sources(ctx: ToolRuntimeContext, question: str) -> list[KnowledgeSourceDTO]:
    return ctx.document_service.search_sources(question)


def _run_tools(
    tools: list,
    question: str,
    *,
    sources: list[KnowledgeSourceDTO] | None = None,
) -> list[dict]:
    results: list[dict] = []
    for tool_fn in tools:
        name = tool_fn.name
        try:
            if name in ("search_documents", "search_manuals"):
                if sources is not None:
                    if not sources:
                        output = (
                            "Nenhum trecho encontrado na base de conhecimento para esta pergunta."
                        )
                    else:
                        output = "\n\n".join(f"[{s.titulo}]\n{s.snippet}" for s in sources)
                else:
                    output = tool_fn.invoke(question)
            elif name == "get_document_keywords":
                if sources:
                    output = ", ".join(s.palavras_chave for s in sources if s.palavras_chave)
                else:
                    output = tool_fn.invoke(question)
            else:
                output = tool_fn.invoke({})
            results.append({"tool": name, "output": str(output)})
        except Exception as exc:
            logger.exception("tool_failed tool=%s", name)
            results.append({"tool": name, "output": f"ERRO: {exc}"})
    return results


def build_orchestrator_graph(ctx: ToolRuntimeContext, llm: ChatOpenAI):
    user_tools = build_user_tools(ctx)
    doc_tools = build_document_tools(ctx)

    def classify(state: AgentState) -> AgentState:
        intent = _classify_intent(llm, state.get("question", ""))
        logger.info("intent_classified user_id=%s intent=%s", state.get("user_id"), intent)
        return {**state, "intent": intent, "tool_results": [], "sources": []}

    def run_profile_tools(state: AgentState) -> AgentState:
        tools = [t for t in user_tools if t.name in ("get_user_email", "get_user_phone")]
        return {**state, "tool_results": _run_tools(tools, state.get("question", ""))}

    def run_address_tools(state: AgentState) -> AgentState:
        tools = [t for t in user_tools if t.name == "get_user_address"]
        return {**state, "tool_results": _run_tools(tools, state.get("question", ""))}

    def run_rag_tools(state: AgentState) -> AgentState:
        question = state.get("question", "")
        sources = _collect_sources(ctx, question)
        return {
            **state,
            "sources": [s.model_dump() for s in sources],
            "tool_results": _run_tools(doc_tools, question, sources=sources),
        }

    def run_general(state: AgentState) -> AgentState:
        doc_count = ctx.document_service.count_documents()
        return {
            **state,
            "sources": [],
            "tool_results": [
                {
                    "tool": "general_chat",
                    "output": (
                        f"Modo conversa geral. Documentos na base: {doc_count}. "
                        "Não é necessário consultar PDFs para esta pergunta."
                    ),
                }
            ],
        }

    def generate_answer(state: AgentState) -> AgentState:
        tool_text = json.dumps(state.get("tool_results", []), ensure_ascii=False, indent=2)
        extra = state.get("context", "")
        if state.get("attachment_context"):
            extra += f"\n\nAnexos:\n{state['attachment_context']}"
        user_content = ANSWER_USER_TEMPLATE.format(
            question=state.get("question", ""),
            tool_results=tool_text,
            context=extra or "(nenhum)",
        )
        response = llm.invoke(
            [
                SystemMessage(content=_answer_system_prompt(state)),
                HumanMessage(content=user_content),
            ]
        )
        content = response.content
        answer = content if isinstance(content, str) else str(content)
        return {**state, "answer": answer}

    def route_intent(state: AgentState) -> str:
        intent = state.get("intent", "general")
        if intent == "profile":
            return "profile_tools"
        if intent == "address":
            return "address_tools"
        if intent in DOCUMENT_INTENTS:
            return "rag_tools"
        return "general_tools"

    graph = StateGraph(AgentState)
    graph.add_node("classify", classify)
    graph.add_node("profile_tools", run_profile_tools)
    graph.add_node("address_tools", run_address_tools)
    graph.add_node("rag_tools", run_rag_tools)
    graph.add_node("general_tools", run_general)
    graph.add_node("generate", generate_answer)

    graph.set_entry_point("classify")
    graph.add_conditional_edges(
        "classify",
        route_intent,
        {
            "profile_tools": "profile_tools",
            "address_tools": "address_tools",
            "rag_tools": "rag_tools",
            "general_tools": "general_tools",
        },
    )
    graph.add_edge("profile_tools", "generate")
    graph.add_edge("address_tools", "generate")
    graph.add_edge("rag_tools", "generate")
    graph.add_edge("general_tools", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


class AgentOrchestrationService:
    def __init__(self, ctx: ToolRuntimeContext) -> None:
        if not settings.OPENAI_API_KEY:
            from src.core.exceptions import MissingConfigurationError

            raise MissingConfigurationError("OPENAI_API_KEY não configurada.")
        self._llm = ChatOpenAI(model="gpt-4o-mini", api_key=SecretStr(settings.OPENAI_API_KEY))
        self._vision_llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=SecretStr(settings.OPENAI_API_KEY),
        )
        self._ctx = ctx
        self._graph = build_orchestrator_graph(ctx, self._llm)

    def _base_activity_fields(self) -> tuple[str | None, str | None, int]:
        """Só expõe base no chat quando há PDFs indexados nela."""
        docs_in_base = self._ctx.document_service.count_documents()
        if docs_in_base <= 0:
            return None, None, 0
        base_id = str(self._ctx.knowledge_base_id) if self._ctx.knowledge_base_id else None
        return base_id, self._ctx.knowledge_base_name, docs_in_base

    def _build_state(self, user_id: UUID, request: AIRequest) -> AgentState:
        images_note = ""
        if request.images:
            images_note = "O usuário enviou imagem(ns) na mensagem."
        return {
            "user_id": str(user_id),
            "question": request.question,
            "context": images_note,
            "attachment_context": request.attachment_context or "",
            "tool_results": [],
            "sources": [],
            "answer": "",
        }

    def _build_activity(self, result: dict) -> AgentActivityDTO:
        intent = str(result.get("intent", "general"))
        tool_results = result.get("tool_results") or []
        tools = [str(item.get("tool", "")) for item in tool_results if item.get("tool")]
        raw_sources = result.get("sources") or []
        sources = [KnowledgeSourceDTO.model_validate(s) for s in raw_sources]
        steps = [
            AgentActivityStepDTO(
                phase="classify",
                label="Classificando intenção",
                detail=INTENT_LABELS.get(intent, intent),
            ),
        ]
        if intent in DOCUMENT_INTENTS:
            steps.append(
                AgentActivityStepDTO(
                    phase="search",
                    label="Consultando base de conhecimento",
                    detail=(
                        f"{len(sources)} documento(s) relevante(s)"
                        if sources
                        else "Nenhum documento correspondente encontrado"
                    ),
                )
            )
        elif intent == "general":
            steps.append(
                AgentActivityStepDTO(
                    phase="chat",
                    label="Respondendo conversa geral",
                    detail="Sem consulta à base de PDFs",
                )
            )
        else:
            steps.append(
                AgentActivityStepDTO(
                    phase="tools",
                    label="Consultando dados do usuário",
                    detail=", ".join(tools) if tools else "Perfil",
                )
            )
        steps.append(AgentActivityStepDTO(phase="generate", label="Gerando resposta", detail=None))
        base_id, base_name, docs_in_base = self._base_activity_fields()
        search_label = f"Consultando {base_name}…" if base_name else None
        status_message = (
            f"Consultando {base_name}…" if base_name and intent in DOCUMENT_INTENTS else None
        )
        if intent in DOCUMENT_INTENTS and base_name:
            steps[1] = AgentActivityStepDTO(
                phase="search",
                label=search_label or "Consultando base de conhecimento",
                detail=(
                    f"{base_name}: buscando nos documentos indexados "
                    f"(PgVector — {len(sources)} trecho(s))"
                    if sources
                    else (
                        f"{base_name}: nenhum trecho correspondente nos "
                        f"{docs_in_base} PDF(s) desta base"
                    )
                ),
            )
        reasoning_log = _format_reasoning_log(
            steps,
            base_name=base_name,
            tools=tools,
            sources=sources,
        )
        return AgentActivityDTO(
            intent=intent,
            steps=steps,
            tools=tools,
            sources=sources,
            documents_in_base=docs_in_base,
            knowledge_base_id=base_id,
            knowledge_base_name=base_name,
            search_label=search_label,
            status_message=status_message or "Estou buscando a melhor resposta para você…",
            reasoning_log=reasoning_log,
        )

    def _yield_answer_chunks(self, answer: str):
        for i in range(0, len(answer), STREAM_CHUNK_SIZE):
            yield {"type": "chunk", "data": answer[i : i + STREAM_CHUNK_SIZE]}
            if i + STREAM_CHUNK_SIZE < len(answer):
                time.sleep(STREAM_CHUNK_DELAY_SEC)

    def ask(self, user_id: UUID, request: AIRequest) -> str:
        if request.images:
            return self._ask_with_vision(user_id, request)
        result = self._graph.invoke(self._build_state(user_id, request))
        return result.get("answer", "")

    def stream_ask_events(self, user_id: UUID, request: AIRequest):
        """Gera eventos: activity (metadados) e chunk (texto)."""
        if request.images:
            yield {
                "type": "activity",
                "data": AgentActivityDTO(
                    intent="vision",
                    steps=[
                        AgentActivityStepDTO(
                            phase="vision",
                            label="Analisando imagem e documentos",
                            detail="Modo multimodal",
                        )
                    ],
                    tools=["search_documents"],
                    sources=_collect_sources(self._ctx, request.question),
                    documents_in_base=self._ctx.document_service.count_documents(),
                ).model_dump(),
            }
            answer = self._ask_with_vision(user_id, request)
            yield from self._yield_answer_chunks(answer)
            return

        state = self._build_state(user_id, request)
        base_id, base_name, docs_in_base = self._base_activity_fields()
        yield {
            "type": "activity",
            "data": AgentActivityDTO(
                intent="",
                steps=[
                    AgentActivityStepDTO(
                        phase="classify",
                        label="Acompanhando sua resposta",
                        detail="Analisando sua pergunta…",
                    )
                ],
                documents_in_base=docs_in_base,
                knowledge_base_id=base_id,
                knowledge_base_name=base_name,
                search_label=f"Consultando {base_name}…" if base_name else "Processando…",
                status_message="Estou buscando a melhor resposta para você…",
            ).model_dump(),
        }

        result = self._graph.invoke(state)
        activity = self._build_activity(result)
        yield {"type": "activity", "data": activity.model_dump()}

        answer = result.get("answer", "")
        yield from self._yield_answer_chunks(answer)

    def stream_ask(self, user_id: UUID, request: AIRequest):
        for event in self.stream_ask_events(user_id, request):
            if event["type"] == "chunk":
                yield event["data"]

    def _ask_with_vision(self, user_id: UUID, request: AIRequest) -> str:  # noqa: ARG002
        sources = _collect_sources(self._ctx, request.question)
        tool_results = _run_tools(
            build_document_tools(self._ctx),
            request.question,
            sources=sources,
        )
        context_text = "\n\n".join(f"[{s.titulo}]\n{s.snippet}" for s in sources)
        vision_prompt = ANSWER_STRICT_PROMPT if sources else ANSWER_GENERAL_PROMPT
        text_parts = [
            vision_prompt,
            f"Contexto RAG:\n{context_text or '(vazio)'}",
            f"Ferramentas:\n{json.dumps(tool_results, ensure_ascii=False)}",
            f"Pergunta:\n{request.question}",
        ]
        content: list[str | dict] = [{"type": "text", "text": "\n\n".join(text_parts)}]
        for image in request.images:
            if image.base64.strip():
                content.append(
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{image.media_type};base64,{image.base64.strip()}",
                        },
                    }
                )
        response = self._vision_llm.invoke([HumanMessage(content=content)])
        raw = response.content
        if isinstance(raw, str):
            return raw
        return str(raw)
