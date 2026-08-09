"""
S3Service
─────────
Thin wrapper around boto3's S3 client used for storing uploaded datasets
and generated PDF reports.

Credentials:
    This service NEVER accepts or configures AWS access keys directly.
    boto3's default credential resolution chain is used, which means:
      - On EC2, credentials come from the attached IAM Instance Profile
        (via the instance metadata service) — this is the production path.
      - Locally, boto3 falls back to `~/.aws/credentials` or standard
        AWS_* environment variables if present, purely for developer
        convenience — nothing in this codebase sets those.

If STORAGE_BACKEND=local (see app/config.py), this service is never
imported/used and the app behaves exactly as it did before Phase 2.
"""

import io
import logging
from typing import Optional

from app.config import get_settings

logger = logging.getLogger("claralytics.s3")
settings = get_settings()


class S3ServiceError(Exception):
    """Raised for any S3-related failure, wrapping the underlying boto error."""


class S3Service:
    _client = None

    @classmethod
    def _get_client(cls):
        if cls._client is None:
            import boto3  # imported lazily so `local` deployments don't need boto3 at all

            cls._client = boto3.client("s3", region_name=settings.AWS_REGION)
        return cls._client

    # ─────────────────────────────────────────────
    # Upload
    # ─────────────────────────────────────────────
    @classmethod
    def upload_bytes(cls, content: bytes, key: str, content_type: Optional[str] = None) -> str:
        """Upload raw bytes to S3 under `key`. Returns the S3 key."""
        if not settings.S3_BUCKET_NAME:
            raise S3ServiceError("S3_BUCKET_NAME is not configured")

        client = cls._get_client()
        extra_args = {"ContentType": content_type} if content_type else {}

        try:
            client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key,
                Body=content,
                **extra_args,
            )
            logger.info(f"Uploaded object to s3://{settings.S3_BUCKET_NAME}/{key}")
            return key
        except Exception as e:
            logger.error(f"S3 upload failed for key={key}: {e}")
            raise S3ServiceError(f"Failed to upload object to S3: {e}") from e

    # ─────────────────────────────────────────────
    # Download
    # ─────────────────────────────────────────────
    @classmethod
    def download_bytes(cls, key: str) -> bytes:
        """Download an object from S3 and return its raw bytes."""
        if not settings.S3_BUCKET_NAME:
            raise S3ServiceError("S3_BUCKET_NAME is not configured")

        client = cls._get_client()
        try:
            obj = client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
            return obj["Body"].read()
        except Exception as e:
            logger.error(f"S3 download failed for key={key}: {e}")
            raise S3ServiceError(f"Failed to download object from S3: {e}") from e

    @classmethod
    def download_to_stream(cls, key: str) -> io.BytesIO:
        return io.BytesIO(cls.download_bytes(key))

    # ─────────────────────────────────────────────
    # Delete
    # ─────────────────────────────────────────────
    @classmethod
    def delete_object(cls, key: str) -> bool:
        if not settings.S3_BUCKET_NAME:
            raise S3ServiceError("S3_BUCKET_NAME is not configured")

        client = cls._get_client()
        try:
            client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
            return True
        except Exception as e:
            logger.error(f"S3 delete failed for key={key}: {e}")
            return False

    # ─────────────────────────────────────────────
    # Presigned URLs (used for report downloads)
    # ─────────────────────────────────────────────
    @classmethod
    def generate_presigned_url(cls, key: str, expires_in: Optional[int] = None, filename: Optional[str] = None) -> str:
        if not settings.S3_BUCKET_NAME:
            raise S3ServiceError("S3_BUCKET_NAME is not configured")

        client = cls._get_client()
        params = {"Bucket": settings.S3_BUCKET_NAME, "Key": key}
        if filename:
            params["ResponseContentDisposition"] = f'attachment; filename="{filename}"'

        try:
            return client.generate_presigned_url(
                "get_object",
                Params=params,
                ExpiresIn=expires_in or settings.S3_PRESIGNED_URL_EXPIRY,
            )
        except Exception as e:
            logger.error(f"Failed to presign URL for key={key}: {e}")
            raise S3ServiceError(f"Failed to generate presigned URL: {e}") from e

    # ─────────────────────────────────────────────
    # Key builders
    # ─────────────────────────────────────────────
    @staticmethod
    def build_dataset_key(user_id: int, unique_filename: str) -> str:
        return f"{settings.S3_UPLOAD_PREFIX}/user_{user_id}/{unique_filename}"

    @staticmethod
    def build_report_key(user_id: int, unique_filename: str) -> str:
        return f"{settings.S3_REPORTS_PREFIX}/user_{user_id}/{unique_filename}"
