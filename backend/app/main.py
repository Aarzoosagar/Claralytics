import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path
 
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
 
from app.config import get_settings
from app.database import init_db
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.middleware.performance_middleware import PerformanceMiddleware
from app.routes import auth, upload, analytics, dashboard, predictions, reports, ai
 
# ─── Logging ─────────────────────────────────────────────────────────────────
settings = get_settings()

_log_format = "%(asctime)s | %(levelname)-8s | %(name)s — %(message)s"
_handlers = [logging.StreamHandler(sys.stdout)]

# Optional: also write to a log file so the CloudWatch Agent can tail it and ship
# it to CloudWatch Logs (see deploy/cloudwatch-agent-config.json). Purely additive —
# if LOG_FILE_PATH isn't set, or the path isn't writable (e.g. local dev), we silently
# skip it and keep logging to stdout only, exactly as before.
if settings.LOG_FILE_PATH:
    try:
        log_path = Path(settings.LOG_FILE_PATH)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        _handlers.append(logging.FileHandler(log_path))
    except Exception:
        pass

logging.basicConfig(
    level=logging.INFO,
    format=_log_format,
    handlers=_handlers,
)
logger = logging.getLogger("claralytics")
 
 
# ─── Lifespan ────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f" Starting {settings.APP_NAME} v{settings.APP_VERSION} "
                f"[storage={settings.STORAGE_BACKEND}, env={settings.ENVIRONMENT}]")
    init_db()
    if not settings.use_s3:
        # Local-disk fallback dirs — not created when STORAGE_BACKEND=s3, since
        # nothing is ever written to local disk in that mode.
        Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.REPORTS_DIR).mkdir(parents=True, exist_ok=True)
    logger.info(f" Database initialised — {settings.DATABASE_URL}")
    yield
    logger.info(" Claralytics shutting down")
 
 
# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Claralytics API",
    description=(
        "**Claralytics** — AI-powered analytics SaaS backend.\n\n"
        "Upload datasets, run advanced analytics, generate ML predictions, "
        "get AI-driven insights, and export professional PDF reports."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)
 
# ─── Middleware ───────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(PerformanceMiddleware)
app.add_middleware(RequestLoggingMiddleware)
 
# ─── Global Exception Handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An internal server error occurred", "detail": str(exc)},
    )
 
# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(analytics.router)
app.include_router(dashboard.router)
app.include_router(predictions.router)
app.include_router(reports.router)
app.include_router(ai.router)
 
 
# ─── Health & Root ────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "product": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
    }
 
 
@app.get("/health", tags=["Health"])
def health():
    from app.database import engine
    try:
        with engine.connect():
            db_ok = True
    except Exception:
        db_ok = False
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
        "version": settings.APP_VERSION,
    }
 
# Debug-only Groq connectivity check. Unauthenticated by design (it's a smoke test),
# so it must never be reachable outside local development. Registered only when
# DEBUG=true — in production (DEBUG=false, the default) this route doesn't exist at all.
if settings.DEBUG:

    @app.get("/test-groq", tags=["Debug"])
    def test_groq():
        from groq import Groq

        fresh_settings = get_settings()
        client = Groq(api_key=fresh_settings.GROQ_API_KEY)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "say hello"}],
        )

        return {
            "reply": response.choices[0].message.content,
            "model": "llama-3.3-70b-versatile",
        }