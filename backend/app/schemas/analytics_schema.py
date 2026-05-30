from pydantic import BaseModel
from typing import Any, Dict, List, Optional


class DatasetOverview(BaseModel):
    rows: int
    columns: int
    missing_values: int
    missing_pct: float
    duplicates: int
    memory_usage_mb: float
    null_percentage_per_column: Dict[str, float]


class ColumnAnalysis(BaseModel):
    numeric_columns: List[str]
    categorical_columns: List[str]
    datetime_columns: List[str]
    boolean_columns: List[str]
    cardinality: Dict[str, int]
    unique_counts: Dict[str, int]


class DescriptiveStats(BaseModel):
    column: str
    mean: Optional[float]
    median: Optional[float]
    mode: Optional[Any]
    std: Optional[float]
    variance: Optional[float]
    skewness: Optional[float]
    kurtosis: Optional[float]
    min: Optional[float]
    max: Optional[float]
    p25: Optional[float]
    p75: Optional[float]
    p95: Optional[float]
    p99: Optional[float]


class CorrelationResult(BaseModel):
    matrix: Dict[str, Dict[str, float]]
    strongest_positive: List[Dict[str, Any]]
    strongest_negative: List[Dict[str, Any]]
    highly_correlated_pairs: List[Dict[str, Any]]


class OutlierResult(BaseModel):
    column: str
    method: str
    outlier_count: int
    outlier_pct: float
    lower_bound: Optional[float]
    upper_bound: Optional[float]
    outlier_indices: List[int]


class DataQualityResult(BaseModel):
    overall_score: float
    missing_severity: str
    duplicate_severity: str
    issues: List[Dict[str, Any]]
    recommendations: List[str]
    column_quality: Dict[str, Dict[str, Any]]


class AnalyticsSummaryResponse(BaseModel):
    success: bool
    dataset_id: int
    overview: DatasetOverview
    column_analysis: ColumnAnalysis
    descriptive_stats: List[DescriptiveStats]
    metadata: Dict[str, Any]