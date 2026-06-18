from contextlib import asynccontextmanager

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from ecommerce_ia.config.logging import configure_logging
from ecommerce_ia.container import get_container
from ecommerce_ia.presentation.api.router import api_router
from ecommerce_ia.presentation.middleware.request_logging import (
    RequestLoggingMiddleware,
)
from ecommerce_ia.presentation.socket.server import sio

configure_logging()


@asynccontextmanager
async def lifespan(_: FastAPI):
    container = get_container()
    await container.bootstrap.startup()
    yield
    await container.bootstrap.shutdown()


def create_app() -> FastAPI:
    container = get_container()

    app = FastAPI(title="Ecommerce IA", lifespan=lifespan)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=container.settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)

    Instrumentator(
        should_group_status_codes=True,
        excluded_handlers=["/metrics"],
    ).instrument(app).expose(
        app,
        endpoint="/metrics",
        include_in_schema=False,
    )

    @app.get("/")
    async def root() -> dict[str, str]:
        snapshot = await container.health_status.get_snapshot()
        return {
            "service": "ecommerce-ia",
            "status": snapshot.status,
        }

    return app


app = create_app()
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
