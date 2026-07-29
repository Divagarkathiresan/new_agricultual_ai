"""JWT creation and FastAPI dependencies for application authentication."""

import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel


JWT_ALGORITHM = "HS256"
bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    """Identity recovered from a validated application JWT."""

    user_id: str


def _jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET_KEY")
    if not secret:
        raise RuntimeError("JWT_SECRET_KEY must be configured before issuing JWTs")
    return secret


def create_access_token(user_id: str) -> str:
    """Create a short-lived token whose `userId` claim identifies the user."""
    expires_in_minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "userId": user_id,
        "iat": now,
        "exp": now + timedelta(minutes=expires_in_minutes),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    """Require and validate an `Authorization: Bearer <token>` header."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials or credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        payload = jwt.decode(credentials.credentials, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        user_id = payload.get("userId")
        if not isinstance(user_id, str) or not user_id:
            raise unauthorized
        return CurrentUser(user_id=user_id)
    except jwt.PyJWTError:
        raise unauthorized
