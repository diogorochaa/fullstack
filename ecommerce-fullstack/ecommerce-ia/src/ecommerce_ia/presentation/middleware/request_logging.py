import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)

SKIPPED_PATHS = {"/metrics"}


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        if path in SKIPPED_PATHS:
            return await call_next(request)

        started_at = time.perf_counter()
        status_code = 500

        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration_ms = round((time.perf_counter() - started_at) * 1000)
            logger.info(
                "HTTP request completed",
                extra={
                    "method": request.method,
                    "path": path,
                    "status": status_code,
                    "duration_ms": duration_ms,
                },
            )
