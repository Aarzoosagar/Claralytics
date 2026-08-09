import io
import pandas as pd
from pathlib import Path
from typing import Tuple, Union
import logging

logger = logging.getLogger(__name__)


def load_dataset(file_path: str) -> pd.DataFrame:
    """Load CSV or XLSX from a LOCAL path into a DataFrame with smart type inference.

    Kept for STORAGE_BACKEND=local (dev fallback) and for any legacy dataset
    rows created before S3 integration was added.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {file_path}")

    ext = path.suffix.lower()
    try:
        if ext == ".csv":
            df = _load_csv_smart(path)
        elif ext in (".xlsx", ".xls"):
            df = pd.read_excel(path, engine="openpyxl")
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    except Exception as e:
        logger.error(f"Failed to load dataset {file_path}: {e}")
        raise

    df = _coerce_dtypes(df)
    return df


def load_dataset_from_bytes(content: bytes, filename: str) -> pd.DataFrame:
    """Load CSV or XLSX from in-memory bytes (used for S3-backed datasets,
    and for the initial upload/profiling pass so we never have to touch disk).
    """
    ext = Path(filename).suffix.lower()

    try:
        if ext == ".csv":
            df = _load_csv_smart_bytes(content)
        elif ext in (".xlsx", ".xls"):
            df = pd.read_excel(io.BytesIO(content), engine="openpyxl")
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    except Exception as e:
        logger.error(f"Failed to load dataset from bytes ({filename}): {e}")
        raise

    return _coerce_dtypes(df)


def get_dataframe_for_dataset(dataset) -> pd.DataFrame:
    """Load a dataset's DataFrame regardless of where it's physically stored.

    - storage_backend == "s3"    -> download from S3 and parse in memory
    - storage_backend == "local" (or unset, legacy rows) -> read from local disk

    This is the single call site every route/service should use instead of
    calling load_dataset(ds.file_path) directly, so storage location stays
    an implementation detail.
    """
    storage_backend = getattr(dataset, "storage_backend", None) or "local"

    if storage_backend == "s3":
        from app.services.s3_service import S3Service

        if not dataset.s3_key:
            raise FileNotFoundError(
                f"Dataset {getattr(dataset, 'id', '?')} is marked as S3-backed but has no s3_key"
            )
        content = S3Service.download_bytes(dataset.s3_key)
        return load_dataset_from_bytes(content, dataset.original_filename)

    return load_dataset(dataset.file_path)


def _load_csv_smart(path: Path) -> pd.DataFrame:
    """Try multiple encodings and separators for robustness (local file)."""
    for encoding in ["utf-8", "latin-1", "cp1252"]:
        for sep in [",", ";", "\t", "|"]:
            try:
                df = pd.read_csv(path, encoding=encoding, sep=sep, low_memory=False)
                if df.shape[1] > 1:
                    return df
            except Exception:
                continue
    # Fallback
    return pd.read_csv(path, low_memory=False)


def _load_csv_smart_bytes(content: bytes) -> pd.DataFrame:
    """Same encoding/separator sniffing as _load_csv_smart, but for in-memory bytes."""
    for encoding in ["utf-8", "latin-1", "cp1252"]:
        for sep in [",", ";", "\t", "|"]:
            try:
                df = pd.read_csv(io.BytesIO(content), encoding=encoding, sep=sep, low_memory=False)
                if df.shape[1] > 1:
                    return df
            except Exception:
                continue
    return pd.read_csv(io.BytesIO(content), low_memory=False)


def _coerce_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    """Attempt datetime parsing on obviously date-like columns."""
    for col in df.columns:
        if df[col].dtype == object:
            sample = df[col].dropna().head(50).astype(str)
            if sample.str.match(r"\d{4}[-/]\d{2}[-/]\d{2}").mean() > 0.5:
                try:
                    df[col] = pd.to_datetime(df[col], infer_datetime_format=True, errors="coerce")
                except Exception:
                    pass
    return df


def get_dataset_meta(df: pd.DataFrame) -> dict:
    """Extract lightweight metadata from a DataFrame."""
    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "dtypes": {col: str(df[col].dtype) for col in df.columns},
        "null_counts": df.isnull().sum().to_dict(),
        "memory_usage_bytes": float(df.memory_usage(deep=True).sum()),
    }