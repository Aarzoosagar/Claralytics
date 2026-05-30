import logging
import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("claralytics.requests")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        # Attach request_id for downstream use
        request.state.request_id = request_id

        logger.info(
            f"[{request_id}] ▶  {request.method} {request.url.path} "
            f"client={request.client.host if request.client else 'unknown'}"
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            duration = (time.perf_counter() - start) * 1000
            logger.error(f"[{request_id}] ✗  {request.method} {request.url.path} "
                         f"UNHANDLED ERROR after {duration:.1f}ms — {exc}")
            raise

        duration = (time.perf_counter() - start) * 1000
        level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            level,
            f"[{request_id}] ◀  {request.method} {request.url.path} "
            f"→ {response.status_code} ({duration:.1f}ms)",
        )

        response.headers["X-Request-ID"] = request_id
        return response