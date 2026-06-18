import socketio

from ecommerce_ia.container import get_container

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=get_container().settings.cors_origins_list,
)


@sio.event
async def connect(sid, _environ):
    await sio.emit("connected", {"clientId": sid}, to=sid)


@sio.event
async def disconnect(sid):
    pass


@sio.on("chat:message")
async def chat_message(sid, data):
    payload = data or {}
    message = payload.get("message", "")
    session_id = payload.get("session_id")

    container = get_container()
    result = await container.customer_chat.execute(message, session_id)

    await sio.emit(
        "chat:reply",
        {
            "reply": result.reply,
            "session_id": result.session_id,
            "sources": [
                {"type": source.type, "id": source.id} for source in result.sources
            ],
            "clientId": sid,
        },
        to=sid,
    )
