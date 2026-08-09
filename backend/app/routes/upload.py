from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user_model import User

from app.models.upload_model import (
    UploadedDataset
)

from app.services.upload_service import (
    UploadService
)

from app.routes.auth import (
    get_current_user
)

from app.utils.helpers import (
    build_response
)

router = APIRouter(
    prefix="/upload",
    tags=["Dataset Upload"],
)


# ─────────────────────────────────────────────
# Upload Dataset
# ─────────────────────────────────────────────
@router.post("/dataset")
async def upload_dataset(

    file: UploadFile = File(...),

    description: str = "",

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Upload CSV/XLSX dataset.
    Automatically:
    - validates
    - profiles
    - extracts metadata
    """

    dataset = (
        await UploadService.save_upload(
            file,
            current_user.id,
            db,
        )
    )

    if description:

        dataset.description = (
            description
        )

        db.commit()
        db.refresh(dataset)

    return build_response(

        success=True,

        message=
        "Dataset uploaded and processed successfully",

        data={

            "dataset_id":
            dataset.id,

            "original_filename":
            dataset.original_filename,

            "file_type":
            dataset.file_type,

            "file_size_kb":
            round(
                (
                    dataset.file_size_bytes
                    or 0
                ) / 1024,
                1,
            ),

            "rows":
            dataset.row_count,

            "columns":
            dataset.column_count,

            "column_names":
            dataset.columns,

            "missing_pct":
            dataset.missing_pct,

            "duplicate_count":
            dataset.duplicate_count,

            "quality_score":
            dataset.quality_score,

            "is_processed":
            dataset.is_processed,

            "processing_error":
            dataset.processing_error,
        },
    )


# ─────────────────────────────────────────────
# Get All Datasets
# ─────────────────────────────────────────────
@router.get("/datasets")
def get_datasets(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Fetch all datasets
    uploaded by current user.
    """

    datasets = (

        db.query(UploadedDataset)

        .filter(
            UploadedDataset.user_id ==
            current_user.id
        )

        .order_by(
            UploadedDataset.created_at.desc()
        )

        .all()
    )

    return build_response(

        success=True,

        message=
        "Datasets fetched successfully",

        data=[

            {

                "id":
                dataset.id,

                "name":
                dataset.original_filename,

                "description":
                dataset.description,

                "file_type":
                dataset.file_type,

                "rows":
                dataset.row_count,

                "columns":
                dataset.column_count,

                "quality_score":
                dataset.quality_score,

                "missing_pct":
                dataset.missing_pct,

                "duplicate_count":
                dataset.duplicate_count,

                "is_processed":
                dataset.is_processed,

                "created_at":
                dataset.created_at,
            }

            for dataset in datasets
        ],
    )