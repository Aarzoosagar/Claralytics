from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    Text,
    Enum,
    Boolean,
)

from sqlalchemy.sql import func

import enum

from app.database import Base


class ReportType(str, enum.Enum):

    analytics = "analytics"
    prediction = "prediction"
    executive = "executive"
    full = "full"


class ReportStatus(str, enum.Enum):

    pending = "pending"
    generating = "generating"
    completed = "completed"
    failed = "failed"


class GeneratedReport(Base):

    __tablename__ = "generated_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    dataset_id = Column(
        Integer,
        ForeignKey(
            "uploaded_datasets.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    title = Column(
        String(500),
        nullable=False,
    )

    report_type = Column(
        Enum(ReportType),
        default=ReportType.full,
    )

    status = Column(
        Enum(ReportStatus),
        default=ReportStatus.pending,
    )

    filename = Column(
        String(500),
        nullable=True,
    )

    file_path = Column(
        String(1000),
        nullable=True,
    )

    file_size_bytes = Column(
        Integer,
        nullable=True,
    )

    sections = Column(
        JSON,
        nullable=True,
    )

    ai_summary = Column(
        Text,
        nullable=True,
    )

    kpi_snapshot = Column(
        JSON,
        nullable=True,
    )

    page_count = Column(
        Integer,
        nullable=True,
    )

    generation_config = Column(
        JSON,
        nullable=True,
    )

    duration_seconds = Column(
        Float,
        nullable=True,
    )

    error_message = Column(
        Text,
        nullable=True,
    )

    include_predictions = Column(
        Boolean,
        default=True,
    )

    include_ai_insights = Column(
        Boolean,
        default=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    def __repr__(self):

        return (
            f"<Report "
            f"id={self.id} "
            f"title={self.title}>"
        )