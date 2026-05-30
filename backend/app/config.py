from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)

from functools import lru_cache
from pathlib import Path
from typing import List


class Settings(BaseSettings):

    # ─── App ─────────────────────

    APP_NAME: str = "Claralytics"

    APP_VERSION: str = "1.0.0"

    DEBUG: bool = False

    SECRET_KEY: str = "fallback-secret"


    # ─── Database ────────────────

    DATABASE_URL: str = (
        "sqlite:///./claralytics.db"
    )


    # ─── JWT ─────────────────────

    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


    # ─── Storage ─────────────────

    UPLOAD_DIR: str = "app/uploads"

    REPORTS_DIR: str = "app/reports"

    MAX_UPLOAD_SIZE_MB: int = 50


    # ─── AI ──────────────────────

    GROQ_API_KEY: str = ""

    OPENAI_API_KEY: str = ""

    AI_PROVIDER: str = "groq"

    AI_MODEL: str = (
        "llama-3.3-70b-versatile"
    )


    # ─── CORS ────────────────────

    ALLOWED_ORIGINS: str = (
    "http://localhost:3000,"
    "http://127.0.0.1:3000,"
    "http://localhost:3001,"
    "http://127.0.0.1:3001,"
    "http://localhost:5173,"
    "http://127.0.0.1:5173"
)


    # ─── Helpers ─────────────────

    @property
    def allowed_origins_list(
        self,
    ) -> List[str]:

        return [
            o.strip()
            for o in self.ALLOWED_ORIGINS.split(",")
        ]


    @property
    def max_upload_bytes(
        self,
    ) -> int:

        return (
            self.MAX_UPLOAD_SIZE_MB
            * 1024
            * 1024
        )


    # ─── Pydantic Settings ───────

    model_config = SettingsConfigDict(

    env_file=".env",

    env_file_encoding="utf-8",

    extra="ignore",
)


@lru_cache()
def get_settings():

    return Settings()