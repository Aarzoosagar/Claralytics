from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models.user_model import User
from app.models.upload_model import UploadedDataset
from app.services.ai_service import AIService
from app.services.analytics_service import AnalyticsService
from app.routes.auth import get_current_user
from app.utils.csv_parser import get_dataframe_for_dataset
from app.utils.validators import validate_dataset_id_ownership
from app.utils.helpers import build_response

router = APIRouter(prefix="/ai", tags=["AI Insights"])


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    dataset_id: Optional[int] = None


@router.get("/insights")
def ai_insights(
    dataset_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate AI-powered executive insights from dataset analytics."""
    ds = db.query(UploadedDataset).filter(UploadedDataset.id == dataset_id).first()
    validate_dataset_id_ownership(ds, current_user.id)

    df = get_dataframe_for_dataset(ds)
    overview = AnalyticsService.get_overview(df)
    quality = AnalyticsService.get_quality(df)
    correlations = AnalyticsService.get_correlations(df)
    outliers = AnalyticsService.get_outliers(df)

    analytics_summary = {
        "overview": overview,
        "quality": quality,
        "correlations": correlations,
        "outliers": [{"column": o["column"], "outlier_pct": o["outlier_pct"]} for o in outliers[:5]],
    }

    insights = AIService.generate_insights(analytics_summary)

    return build_response(
        success=True,
        message="AI insights generated",
        data={
            "dataset_id": dataset_id,
            "dataset_name": ds.original_filename,
            "insights": insights,
            "analytics_context": {
                "rows": overview["rows"],
                "columns": overview["columns"],
                "quality_score":
    quality.get("overall_score")
    or quality.get("quality_score")
    or 0,
            },
        },
    )


@router.post("/chat")
def ai_chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Interactive AI chat with optional dataset context."""
    dataset_context = None
    if body.dataset_id:
        ds = db.query(UploadedDataset).filter(UploadedDataset.id == body.dataset_id).first()
        if ds and ds.user_id == current_user.id and ds.is_processed:
            dataset_context = json.dumps({
                "filename": ds.original_filename,
                "rows": ds.row_count,
                "columns": ds.column_count,
                "column_names": ds.columns,
                "missing_pct": ds.missing_pct,
                "quality_score": ds.quality_score,
            })

    messages = [{"role": m.role, "content": m.content} for m in body.messages]
    reply = AIService.chat(messages, dataset_context)

    return build_response(
        success=True,
        message="AI response generated",
        data={"reply": reply, "model": __import__("app.config", fromlist=["get_settings"]).get_settings().AI_MODEL},
    )