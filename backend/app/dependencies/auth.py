import uuid
from datetime import UTC, datetime

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.permissions import ROLE_PERMISSIONS, PermissionEnum, RoleEnum
from app.core.security import decode_access_token, ensure_utc
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate JWT token and return the current authenticated user."""
    if not credentials:
        raise UnauthorizedException("Authentication token is required")

    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str: str = payload.get("sub")
        if not user_id_str:
            raise UnauthorizedException("Invalid token payload")
        user_id = uuid.UUID(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise UnauthorizedException("Could not validate credentials")

    # Fetch user with roles
    stmt = select(User).where(User.id == user_id, User.is_deleted == False)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise UnauthorizedException("User not found or has been deactivated")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive")

    # Check lockout
    if user.lockout_until and ensure_utc(user.lockout_until) > datetime.now(UTC):
        raise UnauthorizedException("Account is temporarily locked due to excessive failed attempts")

    return user


def require_roles(*allowed_roles: RoleEnum):
    """Dependency factory checking that the current user has at least one of the specified roles."""

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_names = {r.name for r in current_user.roles}
        required_role_names = {r.value for r in allowed_roles}
        if not user_role_names.intersection(required_role_names):
            raise ForbiddenException("User does not have permission to access this resource")
        return current_user

    return role_checker


def require_permission(permission: PermissionEnum):
    """Dependency factory checking that the current user's role grants the given permission."""

    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        user_permissions = set()
        for r in current_user.roles:
            try:
                role_enum = RoleEnum(r.name)
                user_permissions.update(ROLE_PERMISSIONS.get(role_enum, set()))
            except ValueError:
                continue

        if permission not in user_permissions:
            raise ForbiddenException(f"Missing required permission: {permission.value}")
        return current_user

    return permission_checker
