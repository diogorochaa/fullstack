from dataclasses import dataclass, field


@dataclass(frozen=True, slots=True)
class ChatSource:
    type: str
    id: str


@dataclass(frozen=True, slots=True)
class AssistantReply:
    reply: str
    sources: tuple[ChatSource, ...] = ()
    context: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class ChatImage:
    data: str
    mime_type: str


@dataclass(frozen=True, slots=True)
class ChatResult:
    reply: str
    session_id: str
    sources: tuple[ChatSource, ...] = ()


@dataclass(frozen=True, slots=True)
class HealthSnapshot:
    service: str
    status: str
    api_reachable: bool
    api_url: str
    catalog_indexed: int
    faq_indexed: int
    capabilities: dict[str, bool] = field(default_factory=dict)
