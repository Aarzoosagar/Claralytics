import pandas as pd
from pathlib import Path
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


def load_dataset(file_path: str) -> pd.DataFrame:
    """Load CSV or XLSX into a DataFrame with smart type inference."""
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


def _load_csv_smart(path: Path) -> pd.DataFrame:
    """Try multiple encodings and separators for robustness."""
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