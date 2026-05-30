import os
import shutil

UPLOAD_DIR = "app/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = [".csv", ".xlsx"]


def save_file(file, filename: str) -> str:

    file_path = f"{UPLOAD_DIR}/{filename}"

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(file, buffer)

    return file_path


def validate_extension(filename: str) -> bool:

    ext = os.path.splitext(filename)[1]

    return ext in ALLOWED_EXTENSIONS


def delete_file(file_path: str) -> bool:

    if os.path.exists(file_path):

        os.remove(file_path)

        return True

    return False