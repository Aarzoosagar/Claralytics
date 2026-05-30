import aiofiles
from pathlib import Path

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
    load_dataset,
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

        # Validate
        ext = validate_file_extension(
            file.filename or "unnamed"
        )

        content = await file.read()

        validate_file_size(
            len(content),
            settings.max_upload_bytes,
        )

        # Create upload directory
        upload_dir = UploadService._ensure_upload_dir()

        unique_name = generate_unique_filename(
            file.filename or f"dataset{ext}"
        )

        file_path = upload_dir / unique_name

        # Save file
        async with aiofiles.open(
            file_path,
            "wb",
        ) as f:

            await f.write(content)

        # Create dataset record
        dataset = UploadedDataset(

            user_id=user_id,

            original_filename=file.filename or unique_name,

            stored_filename=unique_name,

            file_path=str(file_path),

            file_type=ext.lstrip("."),

            file_size_bytes=len(content),

            is_processed=False,
        )

        db.add(dataset)

        db.commit()

        db.refresh(dataset)

        # Parse metadata
        try:

            df = load_dataset(
                str(file_path)
            )

            meta = get_dataset_meta(df)

            total_cells = (
                meta["rows"]
                * max(meta["columns"], 1)
            )

            missing_cells = sum(
                meta["null_counts"].values()
            )

            missing_pct = (
                (missing_cells / total_cells) * 100
                if total_cells > 0
                else 0
            )

            dataset.row_count = meta["rows"]

            dataset.column_count = meta["columns"]

            dataset.columns = meta["column_names"]

            dataset.missing_pct = round(
                missing_pct,
                2,
            )

            dataset.duplicate_count = int(
                df.duplicated().sum()
            )

            dataset.quality_score = (
                UploadService._compute_quality_score(df)
            )

            dataset.is_processed = True

            db.commit()

            db.refresh(dataset)

        except Exception as e:

            logger.warning(
                f"Could not parse dataset {dataset.id}: {e}"
            )

            dataset.processing_error = str(e)

            db.commit()

        return dataset

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