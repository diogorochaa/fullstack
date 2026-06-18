from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.error_handlers import register_exception_handlers
from src.api.routes.agent import router as agent_router
from src.api.routes.auth import router as auth_router
from src.api.routes.documents import router as documents_router
from src.api.routes.health import router as health_router
from src.api.routes.knowledge_bases import router as knowledge_bases_router
from src.api.routes.messages import router as messages_router
from src.api.routes.profile import router as profile_router
from src.realtime.socket_server import mount_socketio

fastapi_app = FastAPI()
register_exception_handlers(fastapi_app)

fastapi_app.include_router(health_router)
fastapi_app.include_router(auth_router)
fastapi_app.include_router(messages_router)
fastapi_app.include_router(documents_router)
fastapi_app.include_router(knowledge_bases_router)
fastapi_app.include_router(profile_router)
fastapi_app.include_router(agent_router)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = fastapi_app
asgi_app = mount_socketio(fastapi_app)
