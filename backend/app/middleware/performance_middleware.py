import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

SLOW_REQUEST_THRESHOLD_MS = 2000


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Add X-Process-Time header and warn on slow endpoints."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"

        if duration_ms > SLOW_REQUEST_THRESHOLD_MS:
            import logging
            logging.getLogger("claralytics.performance").warning(
                f"SLOW REQUEST: {request.method} {request.url.path} took {duration_ms:.0f}ms"
            )

        return response