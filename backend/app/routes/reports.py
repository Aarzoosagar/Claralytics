
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_model import User
from app.models.upload_model import UploadedDataset
from app.models.report_model import (
    GeneratedReport,
    ReportStatus,
)
from app.services.analytics_service import AnalyticsService
from app.services.ai_service import AIService
from app.services.report_service import ReportService
from app.routes.auth import get_current_user
from app.utils.csv_parser import load_dataset
from app.utils.validators import validate_dataset_id_ownership
from app.utils.helpers import build_response
from app.schemas.report_schema import ReportGenerateRequest

router = APIRouter(
    prefix="/reports",
    tags=["Report Generation"],
)


@router.post("/generate")
def generate_report(
    body: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a professional PDF analytics report.
    """

    ds = (
        db.query(UploadedDataset)
        .filter(
            UploadedDataset.id == body.dataset_id
        )
        .first()
    )

    validate_dataset_id_ownership(
        ds,
        current_user.id,
    )

    title = (
        body.title
        or f"Analytics Report — {ds.original_filename}"
    )

    report = GeneratedReport(
        user_id=current_user.id,
        dataset_id=ds.id,
        title=title,
        report_type=body.report_type,
        status=ReportStatus.generating,
        generation_config=body.model_dump(),
        include_predictions=body.include_predictions,
        include_ai_insights=body.include_ai_insights,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    start = time.perf_counter()

    try:

        df = load_dataset(ds.file_path)

        overview = AnalyticsService.get_overview(df)
        quality = AnalyticsService.get_quality(df)

        import numpy as np

        numeric = df.select_dtypes(
            include=[np.number]
        )

        kpis = {
            col: round(
                float(numeric[col].sum()),
                2
            )
            for col in numeric.columns[:8]
            if numeric[col].notna().any()
        }

        # --------------------------------
        # AI SUMMARY
        # --------------------------------

        ai_summary = ""

        if body.include_ai_insights:

            analysis_context = {
                "dataset_name":
                    ds.original_filename,

                "columns":
                    df.columns.tolist(),

                "overview":
                    overview,

                "quality":
                    quality,

                "kpis":
                    kpis,

                "column_analysis":
                    AnalyticsService
                    .get_column_analysis(df),
            }

            try:

                ai_summary = (
                    AIService
                    .generate_report_summary(
                        analysis_context
                    )
                )

            except Exception as ai_error:

                print(
                    "AI REPORT ERROR:",
                    str(ai_error)
                )

                ai_summary = (
                    "AI summary generation "
                    f"failed: {str(ai_error)}"
                )

        # --------------------------------
        # PDF GENERATION
        # --------------------------------

        file_path = (
            ReportService.generate_pdf(
                title=title,
                overview=overview,
                analytics=(
                    AnalyticsService
                    .get_column_analysis(df)
                ),
                quality=quality,
                kpis=kpis,
                ai_summary=ai_summary,
                predictions=None,
                user_name=current_user.full_name,
                dataset_name=(
                    ds.original_filename
                ),
            )
        )

        file_size = os.path.getsize(
            file_path
        )

        filename = Path(
            file_path
        ).name

        duration = (
            time.perf_counter()
            - start
        )

        report.status = (
            ReportStatus.completed
        )

        report.filename = filename
        report.file_path = file_path
        report.file_size_bytes = file_size

        report.ai_summary = (
            ai_summary[:2000]
            if ai_summary
            else None
        )

        report.kpi_snapshot = kpis

        report.duration_seconds = round(
            duration,
            2,
        )

        report.completed_at = (
            datetime.now(
                timezone.utc
            )
        )

        report.page_count = 4

        db.commit()

        return build_response(
            success=True,
            message=(
                "Report generated "
                "successfully"
            ),
            data={
                "report_id":
                    report.id,

                "title":
                    title,

                "filename":
                    filename,

                "file_size_kb":
                    round(
                        file_size / 1024,
                        1,
                    ),

                "duration_seconds":
                    round(
                        duration,
                        2,
                    ),

                "download_url":
                    f"/reports/download/{report.id}",
            },
        )

    except Exception as e:

        report.status = ReportStatus.failed
        report.error_message = str(e)

        db.commit()

        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=str(e),
        )


@router.get("/download/{report_id}")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    report = (
        db.query(GeneratedReport)
        .filter(
            GeneratedReport.id == report_id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    if (
        report.status
        != ReportStatus.completed
        or not report.file_path
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Report is not ready "
                "for download"
            ),
        )

    if not Path(
        report.file_path
    ).exists():

        raise HTTPException(
            status_code=404,
            detail=(
                "Report file no longer exists"
            ),
        )

    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=(
            report.filename
            or "claralytics_report.pdf"
        ),
    )


@router.get("")
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    reports = (
        db.query(GeneratedReport)
        .filter(
            GeneratedReport.user_id
            == current_user.id
        )
        .order_by(
            GeneratedReport.id.desc()
        )
        .all()
    )

    report_data = [
        {
            "id": r.id,
            "title": r.title,
            "status": r.status.value,
            "report_type": r.report_type.value,
            "created_at": r.created_at,
            "file_size_bytes": r.file_size_bytes,
        }
        for r in reports
    ]

    return build_response(
        success=True,
        message=(
            "Reports fetched successfully"
        ),
        data=report_data,
    )

