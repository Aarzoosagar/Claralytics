from sqlalchemy import Column, Integer, String, Text

from app.database import Base


class AnalyticsResult(Base):

    __tablename__ = "analytics_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    file_id = Column(
        Integer,
        nullable=False
    )

    summary = Column(
        Text,
        nullable=True
    )

    insights = Column(
        Text,
        nullable=True
    )