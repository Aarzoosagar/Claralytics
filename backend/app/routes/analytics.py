from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_model import User
from app.models.upload_model import UploadedDataset
from app.services.analytics_service import AnalyticsService
from app.routes.auth import get_current_user
from app.utils.csv_parser import load_dataset
from app.utils.validators import validate_dataset_id_ownership
from app.utils.helpers import build_response

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _get_owned_dataset(dataset_id: int, db: Session, user: User) -> UploadedDataset:
    ds = db.query(UploadedDataset).filter(UploadedDataset.id == dataset_id).first()
    validate_dataset_id_ownership(ds, user.id)
    return ds


@router.get("/summary")
def analytics_summary(
    dataset_id: int = Query(..., description="ID of the uploaded dataset"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full analytics summary: overview + column analysis + descriptive stats."""
    ds = _get_owned_dataset(dataset_id, db, current_user)
    df = load_dataset(ds.file_path)

    overview = {

    "rows":
        int(df.shape[0]),

    "columns":
        int(df.shape[1]),

    "missing_pct":
        float(
            df.isnull()
            .sum()
            .sum()
            /
            (
                df.shape[0] *
                max(df.shape[1], 1)
            )
            * 100
        ),

    "duplicate_count":
        int(
            df.duplicated().sum()
        ),

    "quality_score":
        float(
            max(
                0,
                100 -
                (
                    (
                        df.isnull()
                        .sum()
                        .sum()
                        /
                        (
                            df.shape[0] *
                            max(df.shape[1], 1)
                        )
                    ) * 40
                )
            )
        ),

    "memory_usage_bytes":
        int(
            df.memory_usage(
                deep=True
            ).sum()
        ),
}
    column_analysis = AnalyticsService.get_column_analysis(df)
    descriptive_stats = AnalyticsService.get_descriptive_stats(df)

    return build_response(
        success=True,
        message="Analytics summary generated",
        data={
            "dataset_id": dataset_id,
            "dataset_name": ds.original_filename,
            "overview": overview,
            "column_analysis": column_analysis,
            "descriptive_stats": descriptive_stats,
        },
    )


@router.get("/correlations")
def analytics_correlations(
    dataset_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pearson correlation matrix and strongest relationships."""
    ds = _get_owned_dataset(dataset_id, db, current_user)
    df = load_dataset(ds.file_path)
    result = AnalyticsService.get_correlations(df)

    return build_response(
        success=True,
        message="Correlation analysis complete",
        data={

    "dataset_id":
        dataset_id,

    "columns":
        list(result.keys()),

    "matrix":
        result,

    "numeric_column_count":
        len(
            df.select_dtypes(
                include="number"
            ).columns
        ),
},
    )


@router.get("/outliers")
def analytics_outliers(
    dataset_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """IQR and Z-score outlier detection across all numeric columns."""
    ds = _get_owned_dataset(dataset_id, db, current_user)
    df = load_dataset(ds.file_path)
    outliers = AnalyticsService.get_outliers(df)

    return build_response(
        success=True,
        message=f"Outlier analysis complete — {len(outliers)} column/method combinations checked",
        data={

    "dataset_id":
        dataset_id,

    "results":
        outliers,

    "total_checks":
        len(outliers),
}
    )


@router.get("/quality")
def analytics_quality(
    dataset_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Comprehensive data quality report with severity scores and recommendations."""
    ds = _get_owned_dataset(dataset_id, db, current_user)
    df = load_dataset(ds.file_path)
    quality = AnalyticsService.get_quality(df)

    return build_response(
        success=True,
        message="Data quality assessment complete",
        data={"dataset_id": dataset_id, **quality},
    )