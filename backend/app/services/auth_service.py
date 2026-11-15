import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    ensure_utc,
    generate_random_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.audit import AuditLog
from app.models.user import PasswordResetToken, RefreshToken, User
from app.schemas.auth import LoginRequest, TokenResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate_user(self, login_data: LoginRequest) -> tuple[User, TokenResponse]:
        """Authenticate user with rate limiting and account lockout protection."""
        stmt = select(User).where(User.email == login_data.email.lower(), User.is_deleted == False)
        result = await self.db.execute(stmt)
        user = result.scalars().first()

        now = datetime.now(UTC)

        if not user:
            # Constant-time comparison mitigation against timing attacks
            verify_password(login_data.password, "$argon2id$v=19$m=65536,t=2,p=2$dummyhashfordummyuser$dummy")
            raise UnauthorizedException("Invalid email or password")

        # Check account lockout
        if user.lockout_until and ensure_utc(user.lockout_until) > now:
            minutes_left = int((ensure_utc(user.lockout_until) - now).total_seconds() / 60) + 1
            raise UnauthorizedException(
                f"Account is temporarily locked due to failed attempts. Try again in {minutes_left} minutes."
            )

        if not user.is_active:
            raise UnauthorizedException("Account is disabled. Please contact your administrator.")

        # Check password
        if not verify_password(login_data.password, user.password_hash):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                user.lockout_until = now + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
            await self.db.commit()
            raise UnauthorizedException("Invalid email or password")

        # Success: reset failed attempts & update last_login
        user.failed_login_attempts = 0
        user.lockout_until = None
        user.last_login_at = now

        # Generate tokens
        role_names = [r.name for r in user.roles]
        claims = {
            "email": user.email,
            "roles": role_names,
            "tenant_id": str(user.tenant_id) if user.tenant_id else None,
        }
        access_token = create_access_token(subject=str(user.id), claims=claims)
        raw_refresh, refresh_hash, refresh_expires_at = create_refresh_token()

        # Save refresh token in DB
        db_refresh = RefreshToken(
            user_id=user.id,
            token_hash=refresh_hash,
            expires_at=refresh_expires_at,
            revoked=False,
        )
        self.db.add(db_refresh)

        # Audit log
        audit = AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="USER_LOGIN",
            entity_name="User",
            entity_id=str(user.id),
            details={"email": user.email, "roles": role_names},
        )
        self.db.add(audit)
        await self.db.commit()

        token_response = TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
        return user, token_response

    async def refresh_tokens(self, raw_refresh_token: str) -> TokenResponse:
        """Rotate refresh token and issue new access token."""
        token_hash = hash_token(raw_refresh_token)
        now = datetime.now(UTC)

        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await self.db.execute(stmt)
        db_token = result.scalars().first()

        if not db_token:
            raise UnauthorizedException("Invalid refresh token")

        if db_token.revoked:
            # Token reuse detected! Revoke all tokens for this user for security
            await self.revoke_all_sessions(db_token.user_id)
            raise UnauthorizedException("Token has been revoked. All sessions invalidated.")

        if ensure_utc(db_token.expires_at) < now:
            raise UnauthorizedException("Refresh token has expired. Please log in again.")

        # Revoke old token (Refresh Token Rotation)
        db_token.revoked = True

        # Fetch user
        stmt_user = select(User).where(User.id == db_token.user_id, User.is_deleted == False)
        result_user = await self.db.execute(stmt_user)
        user = result_user.scalars().first()

        if not user or not user.is_active:
            raise UnauthorizedException("User account is inactive or removed")

        # Issue new pair
        role_names = [r.name for r in user.roles]
        claims = {
            "email": user.email,
            "roles": role_names,
            "tenant_id": str(user.tenant_id) if user.tenant_id else None,
        }
        new_access_token = create_access_token(subject=str(user.id), claims=claims)
        new_raw_refresh, new_refresh_hash, new_refresh_expires_at = create_refresh_token()

        new_db_token = RefreshToken(
            user_id=user.id,
            token_hash=new_refresh_hash,
            expires_at=new_refresh_expires_at,
            revoked=False,
        )
        self.db.add(new_db_token)
        await self.db.commit()

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_raw_refresh,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def logout(self, raw_refresh_token: str) -> None:
        """Revoke a single refresh token session."""
        token_hash = hash_token(raw_refresh_token)
        stmt = update(RefreshToken).where(RefreshToken.token_hash == token_hash).values(revoked=True)
        await self.db.execute(stmt)
        await self.db.commit()

    async def revoke_all_sessions(self, user_id: uuid.UUID) -> None:
        """Revoke all active refresh tokens for the user."""
        stmt = update(RefreshToken).where(RefreshToken.user_id == user_id).values(revoked=True)
        await self.db.execute(stmt)
        await self.db.commit()

    async def request_password_reset(self, email: str) -> str | None:
        """
        Create a password reset token.
        Always returns generic message to client to prevent user enumeration.
        """
        stmt = select(User).where(User.email == email.lower(), User.is_deleted == False)
        result = await self.db.execute(stmt)
        user = result.scalars().first()

        if not user:
            return None

        raw_token = generate_random_token(32)
        token_hash = hash_token(raw_token)
        expires_at = datetime.now(UTC) + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            used=False,
        )
        self.db.add(reset_token)
        await self.db.commit()
        return raw_token

    async def confirm_password_reset(self, raw_token: str, new_password: str) -> None:
        """Reset password using reset token."""
        token_hash = hash_token(raw_token)
        now = datetime.now(UTC)

        stmt = select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used == False,
            PasswordResetToken.expires_at > now,
        )
        result = await self.db.execute(stmt)
        db_token = result.scalars().first()

        if not db_token:
            raise BadRequestException("Invalid or expired password reset token")

        db_token.used = True

        stmt_user = select(User).where(User.id == db_token.user_id)
        result_user = await self.db.execute(stmt_user)
        user = result_user.scalars().first()

        if not user:
            raise NotFoundException("User not found")

        user.password_hash = hash_password(new_password)
        user.failed_login_attempts = 0
        user.lockout_until = None

        # Revoke all existing sessions
        await self.revoke_all_sessions(user.id)
        await self.db.commit()

    async def change_password(self, user: User, current_password: str, new_password: str) -> None:
        """Change password for authenticated user."""
        if not verify_password(current_password, user.password_hash):
            raise BadRequestException("Current password is incorrect")

        user.password_hash = hash_password(new_password)
        await self.revoke_all_sessions(user.id)
        await self.db.commit()
