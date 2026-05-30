from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime


class ForecastRequest(BaseModel):
    dataset_id: int
    target_column: str
    periods: int = 30
    feature_columns: Optional[List[str]] = None


class ChurnRequest(BaseModel):
    dataset_id: int
    target_column: str
    feature_columns: Optional[List[str]] = None
    threshold: float = 0.5


class SegmentationRequest(BaseModel):
    dataset_id: int
    feature_columns: Optional[List[str]] = None
    n_clusters: int = 4


class AnomalyRequest(BaseModel):
    dataset_id: int
    feature_columns: Optional[List[str]] = None
    contamination: float = 0.05


class PredictionMetrics(BaseModel):
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    silhouette_score: Optional[float] = None


class PredictionResponse(BaseModel):
    success: bool
    prediction_id: int
    prediction_type: str
    status: str
    results: Dict[str, Any]
    metrics: PredictionMetrics
    feature_importance: Optional[Dict[str, float]] = None
    duration_seconds: float
    metadata: Dict[str, Any]