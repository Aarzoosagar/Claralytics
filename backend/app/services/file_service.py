"""
DEPRECATED / UNUSED.

This module predates the real upload pipeline and is not imported anywhere
in the app (see app/services/upload_service.py, which is what
app/routes/upload.py actually calls). It's kept only for backward
compatibility in case external scripts import it directly. It intentionally
still only supports local disk — do not use it for anything S3-backed.
"""

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