import uuid
import time
from datetime import datetime, timezone
from typing import Any, Dict
from pathlib import Path


def generate_unique_filename(original_name: str) -> str:
    """Prefix original filename with a UUID timestamp for uniqueness."""
    ext = Path(original_name).suffix.lower()
    stem = Path(original_name).stem[:50]
    uid = uuid.uuid4().hex[:8]
    ts = int(time.time())
    return f"{ts}_{uid}_{stem}{ext}"


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def safe_float(value: Any) -> float | None:
    """Convert a value to float, returning None on failure."""
    try:
        f = float(value)
        import math
        return None if math.isnan(f) or math.isinf(f) else round(f, 6)
    except (TypeError, ValueError):
        return None


def build_response(success: bool, message: str, data: Any = None, **kwargs) -> Dict[str, Any]:
    """Standard API response envelope."""
    resp: Dict[str, Any] = {
        "success": success,
        "message": message,
        "timestamp": utcnow().isoformat(),
    }
    if data is not None:
        resp["data"] = data
    resp.update(kwargs)
    return resp


def truncate_dict_values(d: dict, max_items: int = 100) -> dict:
    """Truncate list values in a dict to avoid oversized responses."""
    result = {}
    for k, v in d.items():
        if isinstance(v, list) and len(v) > max_items:
            result[k] = v[:max_items]
        else:
            result[k] = v
    return result