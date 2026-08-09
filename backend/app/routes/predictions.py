import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_model import User
from app.models.upload_model import UploadedDataset
from app.models.prediction_model import PredictionHistory, PredictionType, PredictionStatus
from app.services.prediction_service import PredictionService
from app.routes.auth import get_current_user
from app.utils.csv_parser import get_dataframe_for_dataset
from app.utils.validators import validate_dataset_id_ownership
from app.utils.helpers import build_response
from app.schemas.prediction_schema import (
    ForecastRequest, ChurnRequest, SegmentationRequest, AnomalyRequest
)

router = APIRouter(prefix="/predictions", tags=["Machine Learning Predictions"])


def _record_prediction(
    db: Session, user_id: int, dataset_id: int,
    pred_type: PredictionType, config: dict,
    result: dict, duration: float
) -> PredictionHistory:
    metrics = result.pop("metrics", {})
    fi = result.pop("feature_importance", None)
    record = PredictionHistory(
        user_id=user_id,
        dataset_id=dataset_id,
        prediction_type=pred_type,
        status=PredictionStatus.completed,
        config=config,
        results=result,
        metrics=metrics,
        feature_importance=fi,
        duration_seconds=duration,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    # Restore for response
    result["metrics"] = metrics
    result["feature_importance"] = fi
    return record


def _load_dataset(dataset_id: int, user_id: int, db: Session):
    ds = db.query(UploadedDataset).filter(UploadedDataset.id == dataset_id).first()
    validate_dataset_id_ownership(ds, user_id)
    df = get_dataframe_for_dataset(ds)
    return ds, df


@router.get("/forecast")
def forecast(
    payload: ForecastRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds, df = _load_dataset(payload.dataset_id, current_user.id, db)
    start = time.perf_counter()
    result = PredictionService.run_forecast(df, payload.target_column, payload.feature_columns, payload.periods)
    duration = time.perf_counter() - start

    record = _record_prediction(db, current_user.id, ds.id, PredictionType.forecast,
                                 payload.model_dump(), result, duration)
    return build_response(
        success=True,
        message="Revenue/sales forecast completed",
        data={"prediction_id": record.id, **result},
    )


@router.get("/churn")
def churn_prediction(
    payload: ChurnRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds, df = _load_dataset(payload.dataset_id, current_user.id, db)
    start = time.perf_counter()
    result = PredictionService.run_churn(df, payload.target_column, payload.feature_columns, payload.threshold)
    duration = time.perf_counter() - start

    record = _record_prediction(db, current_user.id, ds.id, PredictionType.churn,
                                 payload.model_dump(), result, duration)
    return build_response(
        success=True,
        message="Churn prediction model completed",
        data={"prediction_id": record.id, **result},
    )


@router.get("/segmentation")
def segmentation(
    payload: SegmentationRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds, df = _load_dataset(payload.dataset_id, current_user.id, db)
    start = time.perf_counter()
    result = PredictionService.run_segmentation(df, payload.feature_columns, payload.n_clusters)
    duration = time.perf_counter() - start

    record = _record_prediction(db, current_user.id, ds.id, PredictionType.segmentation,
                                 payload.model_dump(), result, duration)
    return build_response(
        success=True,
        message=f"Customer segmentation completed — {result.get('n_clusters', 0)} segments identified",
        data={"prediction_id": record.id, **result},
    )


@router.get("/anomalies")
def anomalies(
    payload: AnomalyRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ds, df = _load_dataset(payload.dataset_id, current_user.id, db)
    start = time.perf_counter()
    result = PredictionService.run_anomaly_detection(df, payload.feature_columns, payload.contamination)
    duration = time.perf_counter() - start

    record = _record_prediction(db, current_user.id, ds.id, PredictionType.anomaly,
                                 payload.model_dump(), result, duration)
    return build_response(
        success=True,
        message=f"Anomaly detection complete — {result.get('anomaly_count', 0)} anomalies detected",
        data={"prediction_id": record.id, **result},
    )