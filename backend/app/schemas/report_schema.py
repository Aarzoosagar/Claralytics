from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime
from app.models.report_model import ReportType


class ReportGenerateRequest(BaseModel):
    dataset_id: int
    title: Optional[str] = None
    report_type: ReportType = ReportType.full
    include_predictions: bool = True
    include_ai_insights: bool = True
    sections: Optional[List[str]] = None  # subset of sections to include


class ReportOut(BaseModel):
    id: int
    title: str
    report_type: str
    status: str
    filename: Optional[str]
    file_size_bytes: Optional[int]
    page_count: Optional[int]
    ai_summary: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ReportGenerateResponse(BaseModel):
    success: bool
    report_id: int
    message: str
    estimated_pages: int
    metadata: Dict[str, Any]