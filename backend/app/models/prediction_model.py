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
)

from sqlalchemy.sql import func

import enum

from app.database import Base


class PredictionType(str, enum.Enum):

    forecast = "forecast"
    churn = "churn"
    segmentation = "segmentation"
    anomaly = "anomaly"


class PredictionStatus(str, enum.Enum):

    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class PredictionHistory(Base):

    __tablename__ = "prediction_history"

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

    prediction_type = Column(
        Enum(PredictionType),
        nullable=False,
    )

    status = Column(
        Enum(PredictionStatus),
        default=PredictionStatus.pending,
    )

    config = Column(
        JSON,
        nullable=True,
    )

    results = Column(
        JSON,
        nullable=True,
    )

    metrics = Column(
        JSON,
        nullable=True,
    )

    feature_importance = Column(
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
            f"<Prediction "
            f"id={self.id} "
            f"type={self.prediction_type}>"
        )