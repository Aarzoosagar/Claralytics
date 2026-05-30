from pydantic import BaseModel


class UploadedFileResponse(BaseModel):

    id: int
    filename: str
    filepath: str
    filetype: str

    class Config:
        from_attributes = True