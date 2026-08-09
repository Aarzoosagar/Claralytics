import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_model import User
from app.models.upload_model import UploadedDataset
from app.routes.auth import get_current_user
from app.utils.csv_parser import get_dataframe_for_dataset
from app.utils.validators import validate_dataset_id_ownership
from app.utils.helpers import build_response, safe_float

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _get_owned_dataset(dataset_id: int, db: Session, user: User) -> UploadedDataset:
    ds = db.query(UploadedDataset).filter(UploadedDataset.id == dataset_id).first()
    validate_dataset_id_ownership(ds, user.id)
    return ds


def _compute_kpis(df: pd.DataFrame) -> dict:
    numeric = df.select_dtypes(include=[np.number])
    kpis = {}
    for col in numeric.columns[:10]:
        series = numeric[col].dropna()
        if len(series) == 0:
            continue
        kpis[f"{col}_total"] = safe_float(series.sum())
        kpis[f"{col}_mean"] = safe_float(series.mean())
        kpis[f"{col}_growth_pct"] = safe_float(
            (series.iloc[-1] - series.iloc[0]) / abs(series.iloc[0]) * 100
        ) if series.iloc[0] != 0 and len(series) > 1 else 0.0
    return kpis


def _compute_trends(
    df: pd.DataFrame
) -> dict:

    numeric = df.select_dtypes(
        include=[np.number]
    )

    trends = {}

    for col in numeric.columns[:6]:

        series = (
            numeric[col]
            .dropna()
            .tolist()
        )

        if len(series) < 2:
            continue

        trends[col] = [
            safe_float(v)
            for v in series[:100]
        ]

    return trends


@router.get("/metrics")
def dashboard_metrics(
    dataset_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """High-level dataset metrics for a business dashboard."""
    ds = _get_owned_dataset(dataset_id, db, current_user)
    df = get_dataframe_for_dataset(ds)

    numeric = df.select_dtypes(include=[np.number])
    cat = df.select_dtypes(include=["object", "category"])

    return build_response(

    success=True,

    message="Dashboard metrics generated",

    data={

        "dataset_id":
            dataset_id,

        "dataset_name":
            ds.original_filename,

        "total_records":
            int(len(df)),

        "total_features":
            int(df.shape[1]),

        "numeric_features":
            int(numeric.shape[1]),

        "categorical_features":
            int(cat.shape[1]),

        "data_completeness_pct":
            round(
                100 - (
                    ds.missing_pct or 0
                ),
                1,
            ),

        "quality_score":
            safe_float(
                ds.quality_score
            ) or 0,

        "numeric_summary": {

            col: {

                "sum":
                    safe_float(
                        numeric[col].sum()
                    ),

                "mean":
                    safe_float(
                        numeric[col].mean()
                    ),

                "max":
                    safe_float(
                        numeric[col].max()
                    ),

                "min":
                    safe_float(
                        numeric[col].min()
                    ),
            }

            for col in numeric.columns[:8]
        },

        # IMPORTANT
        "categorical_distributions": [

            {

                "column": col,

                "counts":
                    df[col]
                    .value_counts()
                    .head(8)
                    .to_dict(),
            }

            for col in cat.columns[:5]
        ],

        # IMPORTANT
        "recent_activity": [

            {

                "type": "upload",

                "description":
                    f"{ds.original_filename} uploaded",

                "timestamp":
                    str(ds.created_at),

                "action":
                    "Uploaded",
            }
        ],
    },
)

@router.get("/trends")
def dashboard_trends(
    dataset_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trend analysis: direction, volatility, and period-over-period change."""
    ds = _get_owned_dataset(dataset_id, db, current_user)
    df = get_dataframe_for_dataset(ds)
    trends = _compute_trends(df)

    return build_response(

    success=True,

    message="Trend analysis generated",

    data={

        "dataset_id":
            dataset_id,

        "dataset_name":
            ds.original_filename,

        "data":
            trends,

        "trend_count":
            len(trends),

        "computed_at":
            __import__(
                "datetime"
            ).datetime.utcnow().isoformat(),
    },
)


@router.get("/kpis")
def dashboard_kpis(

    dataset_id: int = Query(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user),
):
    """
    Dashboard KPI snapshot.
    """

    ds = _get_owned_dataset(
        dataset_id,
        db,
        current_user,
    )

    df = get_dataframe_for_dataset(ds)

    numeric = df.select_dtypes(
        include=[np.number]
    )

    return build_response(

        success=True,

        message="KPI metrics generated",

        data={

            "dataset_id": dataset_id,

            "rows": int(
                df.shape[0]
            ),

            "columns": int(
                df.shape[1]
            ),

            "numeric_columns": int(
                numeric.shape[1]
            ),

            "missing_pct":
                safe_float(
                    ds.missing_pct
                ) or 0,

            "quality_score":
                safe_float(
                    ds.quality_score
                ) or 0,

            "duplicate_count":
                int(
                    ds.duplicate_count or 0
                ),

            "dataset_name":
                ds.original_filename,

            "computed_at":
                __import__(
                    "datetime"
                ).datetime.utcnow().isoformat(),
        },
    )