from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.presentation.errors.error_handlers import register_exception_handlers
from src.presentation.routes import ai, auth, health, messages, upload

app = FastAPI()
register_exception_handlers(app)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(upload.router)
app.include_router(messages.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # depois restringe
    # Com origem curinga, credenciais devem ficar desativadas (regra do CORS).
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
