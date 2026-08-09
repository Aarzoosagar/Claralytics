from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    ForeignKey,
    JSON,
    DateTime,
)

from sqlalchemy.sql import func

from app.database import Base


class UploadedDataset(Base):

    __tablename__ = "uploaded_datasets"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    original_filename = Column(String, nullable=False)

    stored_filename = Column(String)

    # Local disk path — only populated when STORAGE_BACKEND=local (dev fallback)
    file_path = Column(String, nullable=True)

    # Where the file actually lives: "s3" or "local"
    storage_backend = Column(String, default="local")

    # S3 object key — only populated when storage_backend="s3"
    s3_key = Column(String, nullable=True)

    s3_bucket = Column(String, nullable=True)

    file_type = Column(String)

    file_size_bytes = Column(Integer)

    row_count = Column(Integer)

    column_count = Column(Integer)

    columns = Column(JSON)

    missing_pct = Column(Float)

    duplicate_count = Column(Integer)

    quality_score = Column(Float)

    is_processed = Column(
        Boolean,
        default=False,
    )

    processing_error = Column(String)

    description = Column(String)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    def __repr__(self):

        return (
            f"<UploadedDataset "
            f"id={self.id} "
            f"name={self.original_filename}>"
        )