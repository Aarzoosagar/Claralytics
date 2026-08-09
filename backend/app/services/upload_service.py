from pathlib import Path

import aiofiles
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.upload_model import UploadedDataset
from app.utils.helpers import generate_unique_filename
from app.utils.validators import (
    validate_file_extension,
    validate_file_size,
)
from app.utils.csv_parser import (
    load_dataset_from_bytes,
    get_dataset_meta,
)

import logging

settings = get_settings()

logger = logging.getLogger(__name__)


class UploadService:

    @staticmethod
    def _ensure_upload_dir() -> Path:

        path = Path(settings.UPLOAD_DIR)

        path.mkdir(
            parents=True,
            exist_ok=True,
        )

        return path

    @staticmethod
    async def save_upload(
        file: UploadFile,
        user_id: int,
        db: Session,
    ) -> UploadedDataset:
        """Validate, persist (S3 or local disk), profile, and record an uploaded dataset.

        Storage location is controlled by settings.STORAGE_BACKEND:
          - "s3"    (default/production): file bytes go straight to S3, nothing is
                     ever written to the EC2 instance's local disk.
          - "local" (dev fallback): original behaviour — written under app/uploads/.
        """

        # Validate
        ext = validate_file_extension(
            file.filename or "unnamed"
        )

        content = await file.read()

        validate_file_size(
            len(content),
            settings.max_upload_bytes,
        )

        unique_name = generate_unique_filename(
            file.filename or f"dataset{ext}"
        )

        if settings.use_s3:
            dataset = await UploadService._save_to_s3(
                content=content,
                unique_name=unique_name,
                original_filename=file.filename or unique_name,
                ext=ext,
                user_id=user_id,
                db=db,
            )
        else:
            dataset = await UploadService._save_to_local(
                content=content,
                unique_name=unique_name,
                original_filename=file.filename or unique_name,
                ext=ext,
                user_id=user_id,
                db=db,
            )

        # Parse metadata (from the in-memory bytes we already have — no re-read needed)
        try:
            df = load_dataset_from_bytes(content, file.filename or unique_name)
            UploadService._apply_profile(dataset, df)
            dataset.is_processed = True
            db.commit()
            db.refresh(dataset)
        except Exception as e:
            logger.warning(f"Could not parse dataset {dataset.id}: {e}")
            dataset.processing_error = str(e)
            db.commit()

        return dataset

    # ─────────────────────────────────────────────
    # Storage backends
    # ─────────────────────────────────────────────
    @staticmethod
    async def _save_to_s3(content, unique_name, original_filename, ext, user_id, db) -> UploadedDataset:
        from app.services.s3_service import S3Service

        s3_key = S3Service.build_dataset_key(user_id, unique_name)

        content_type = "text/csv" if ext == ".csv" else (
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        S3Service.upload_bytes(content, s3_key, content_type=content_type)

        dataset = UploadedDataset(
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=unique_name,
            storage_backend="s3",
            s3_key=s3_key,
            s3_bucket=settings.S3_BUCKET_NAME,
            file_path=None,
            file_type=ext.lstrip("."),
            file_size_bytes=len(content),
            is_processed=False,
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    @staticmethod
    async def _save_to_local(content, unique_name, original_filename, ext, user_id, db) -> UploadedDataset:
        upload_dir = UploadService._ensure_upload_dir()
        file_path = upload_dir / unique_name

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        dataset = UploadedDataset(
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=unique_name,
            storage_backend="local",
            file_path=str(file_path),
            file_type=ext.lstrip("."),
            file_size_bytes=len(content),
            is_processed=False,
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    # ─────────────────────────────────────────────
    # Profiling (unchanged logic, extracted for reuse)
    # ─────────────────────────────────────────────
    @staticmethod
    def _apply_profile(dataset: UploadedDataset, df) -> None:
        meta = get_dataset_meta(df)

        total_cells = meta["rows"] * max(meta["columns"], 1)
        missing_cells = sum(meta["null_counts"].values())
        missing_pct = (missing_cells / total_cells) * 100 if total_cells > 0 else 0

        dataset.row_count = meta["rows"]
        dataset.column_count = meta["columns"]
        dataset.columns = meta["column_names"]
        dataset.missing_pct = round(missing_pct, 2)
        dataset.duplicate_count = int(df.duplicated().sum())
        dataset.quality_score = UploadService._compute_quality_score(df)

    @staticmethod
    def _compute_quality_score(df) -> float:

        total_cells = (
            df.shape[0]
            * df.shape[1]
        )

        if total_cells == 0:
            return 0.0

        missing_penalty = (
            df.isnull().sum().sum()
            / total_cells
        ) * 40

        duplicate_penalty = (
            df.duplicated().sum()
            / max(df.shape[0], 1)
        ) * 20

        score = max(
            0.0,
            100 - missing_penalty - duplicate_penalty,
        )

        return round(
            float(score),
            1,
        )
