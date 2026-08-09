from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    OAuth2PasswordBearer,
)

from sqlalchemy.orm import Session

from passlib.context import CryptContext

from datetime import timedelta

from app.database import get_db

from app.models.user_model import User

from app.schemas.user_schema import (
    UserRegister,
    UserLogin,
    UserOut,
    TokenResponse,
    AuthResponse,
)

from app.utils.jwt_handler import (
    create_access_token,
    decode_access_token,
)

from app.config import get_settings


settings = get_settings()

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)

# ONLY used to extract Bearer token
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ─────────────────────────────────────────────
# Password Helpers
# ─────────────────────────────────────────────
def _hash_password(password: str) -> str:

    return pwd_context.hash(password)


def _verify_password(
    plain: str,
    hashed: str,
) -> bool:

    return pwd_context.verify(
        plain,
        hashed,
    )


# ─────────────────────────────────────────────
# Current User Dependency
# ─────────────────────────────────────────────
def get_current_user(

    token: str = Depends(
        oauth2_scheme
    ),

    db: Session = Depends(get_db),

) -> User:

    try:

        payload = decode_access_token(
            token
        )

        user_id = payload.get("sub")

        if not user_id:

            raise HTTPException(
                status_code=
                status.HTTP_401_UNAUTHORIZED,

                detail=
                "Invalid token",
            )

        user = (
            db.query(User)
            .filter(
                User.id == int(user_id)
            )
            .first()
        )

        if (
            not user or
            not user.is_active
        ):

            raise HTTPException(
                status_code=
                status.HTTP_401_UNAUTHORIZED,

                detail=
                "User not found",
            )

        return user

    except Exception:

        raise HTTPException(
            status_code=
            status.HTTP_401_UNAUTHORIZED,

            detail=
            "Authentication failed",
        )


# ─────────────────────────────────────────────
# Register
# ─────────────────────────────────────────────
@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(

    payload: UserRegister,

    db: Session = Depends(get_db),

):

    existing_user = (
        db.query(User)
        .filter(
            User.email ==
            payload.email
        )
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=
            status.HTTP_409_CONFLICT,

            detail=
            "Email already registered",
        )

    user = User(

        email=payload.email,

        full_name=payload.full_name,

        hashed_password=
        _hash_password(
            payload.password
        ),

        organization=
        payload.organization,
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        },

        timedelta(
            minutes=
            settings
            .ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )

    return AuthResponse(

        success=True,

        message=
        "Account created successfully",

        data=TokenResponse(

            access_token=token,

            expires_in=(
                settings
                .ACCESS_TOKEN_EXPIRE_MINUTES
                * 60
            ),

            user=
            UserOut.model_validate(
                user
            ),
        ),
    )


# ─────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────
@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(

    payload: UserLogin,

    db: Session = Depends(get_db),

):

    user = (
        db.query(User)
        .filter(
            User.email ==
            payload.email
        )
        .first()
    )

    if (
        not user or
        not _verify_password(
            payload.password,
            user.hashed_password,
        )
    ):

        raise HTTPException(
            status_code=
            status.HTTP_401_UNAUTHORIZED,

            detail=
            "Invalid credentials",
        )

    if not user.is_active:

        raise HTTPException(
            status_code=
            status.HTTP_403_FORBIDDEN,

            detail=
            "Account deactivated",
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        },

        timedelta(
            minutes=
            settings
            .ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )

    return AuthResponse(

        success=True,

        message="Login successful",

        data=TokenResponse(

            access_token=token,

            expires_in=(
                settings
                .ACCESS_TOKEN_EXPIRE_MINUTES
                * 60
            ),

            user=
            UserOut.model_validate(
                user
            ),
        ),
    )


# ─────────────────────────────────────────────
# Current User
# ─────────────────────────────────────────────
@router.get(
    "/me",
    response_model=UserOut,
)
def get_me(

    current_user: User = Depends(
        get_current_user
    ),

):

    return UserOut.model_validate(
        current_user
    )