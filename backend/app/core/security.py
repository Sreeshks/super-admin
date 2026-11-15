import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import settings

# Argon2id password hasher with secure parameters
_pwd_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,  # 64 MB
    parallelism=2,
    hash_len=32,
    salt_len=16,
)


def ensure_utc(dt: datetime | None) -> datetime | None:
    """Ensure datetime is timezone-aware UTC datetime."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return _pwd_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against Argon2 hash."""
    try:
        return _pwd_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def hash_token(token: str) -> str:
    """Hash a token using SHA-256 for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_random_token(length: int = 32) -> str:
    """Generate a cryptographically secure random urlsafe token."""
    return secrets.token_urlsafe(length)


def create_access_token(
    subject: str, claims: dict[str, Any] | None = None, expires_delta: timedelta | None = None
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(UTC)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(subject),
        "jti": secrets.token_hex(16),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access",
    }
    if claims:
        payload.update(claims)

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token() -> tuple[str, str, datetime]:
    """
    Generate an opaque secure refresh token.
    Returns: (raw_token, token_hash, expires_at)
    """
    raw_token = generate_random_token(48)
    token_hash = hash_token(raw_token)
    expires_at = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return raw_token, token_hash, expires_at


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Enforces strict algorithm validation to prevent algorithm downgrade attacks.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options={"require": ["exp", "sub", "iat"]}
        )
        if payload.get("type") != "access":
            raise jwt.InvalidTokenError("Token type must be access")
        return payload
    except jwt.PyJWTError as e:
        raise e
