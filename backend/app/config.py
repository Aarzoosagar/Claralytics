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

    # "s3" (production/AWS) or "local" (dev fallback, original behaviour)
    STORAGE_BACKEND: str = "local"

    UPLOAD_DIR: str = "app/uploads"

    REPORTS_DIR: str = "app/reports"

    MAX_UPLOAD_SIZE_MB: int = 50


    # ─── AWS / S3 ────────────────

    # No access keys here on purpose. In production the EC2 instance
    # authenticates via an attached IAM Instance Profile (see deploy/iam-policy.json).
    # boto3 picks that up automatically through its default credential chain.
    AWS_REGION: str = "ap-south-1"

    S3_BUCKET_NAME: str = ""

    S3_UPLOAD_PREFIX: str = "datasets"

    S3_REPORTS_PREFIX: str = "reports"

    # Seconds a presigned report-download URL stays valid
    S3_PRESIGNED_URL_EXPIRY: int = 300


    # ─── Environment / Ops ───────

    ENVIRONMENT: str = "development"  # development | production

    # Local file CloudWatch Agent tails (see deploy/cloudwatch-agent-config.json)
    LOG_FILE_PATH: str = ""


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

    @property
    def use_s3(self) -> bool:
        """True when the app should read/write datasets & reports via S3."""
        return self.STORAGE_BACKEND.lower() == "s3"


    # ─── Pydantic Settings ───────

    model_config = SettingsConfigDict(

    env_file=".env",

    env_file_encoding="utf-8",

    extra="ignore",
)


@lru_cache()
def get_settings():

    return Settings()