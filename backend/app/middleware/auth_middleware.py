from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_model import User
from app.utils.jwt_handler import verify_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    email = payload.get("sub")

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user