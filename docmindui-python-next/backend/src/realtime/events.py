"""Nomes de eventos Socket.IO (contrato com o frontend)."""


class SocketEvents:
    """Cliente → servidor."""

    AI_ASK = "ai:ask"

    """Servidor → cliente."""

    AI_ACTIVITY = "ai:activity"
    AI_CHUNK = "ai:chunk"
    AI_DONE = "ai:done"
    AI_ERROR = "ai:error"
    CONNECTED = "connected"
