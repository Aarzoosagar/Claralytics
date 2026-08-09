from fastapi import HTTPException, status
from typing import Optional
import re

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


def validate_file_extension(filename: str) -> str:
    """Return the lowercase extension or raise 400."""
    from pathlib import Path
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' is not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    return ext


def validate_file_size(size_bytes: int, max_bytes: int) -> None:
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size {size_bytes / 1e6:.1f} MB exceeds limit of {max_bytes / 1e6:.0f} MB",
        )


def validate_dataset_id_ownership(dataset, user_id: int) -> None:
    """Ensure the dataset belongs to the requesting user."""
    if dataset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
    if dataset.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this dataset")


def sanitize_filename(name: str) -> str:
    """Strip unsafe characters from a filename."""
    name = re.sub(r"[^\w\-_. ]", "_", name)
    return name[:200]