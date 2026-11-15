from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rate_limit import rate_limit_login
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.common import StandardResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=StandardResponse[TokenResponse], dependencies=[Depends(rate_limit_login)])
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    user, tokens = await service.authenticate_user(data)
    return StandardResponse(
        message="Login successful",
        data=tokens,
    )


@router.post("/refresh", response_model=StandardResponse[TokenResponse])
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    tokens = await service.refresh_tokens(data.refresh_token)
    return StandardResponse(
        message="Token refreshed successfully",
        data=tokens,
    )


@router.post("/logout", response_model=StandardResponse[None])
async def logout(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.logout(data.refresh_token)
    return StandardResponse(
        message="Logged out successfully",
        data=None,
    )


@router.post("/logout-all", response_model=StandardResponse[None])
async def logout_all(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.revoke_all_sessions(current_user.id)
    return StandardResponse(
        message="All active sessions revoked successfully",
        data=None,
    )


@router.post("/forgot-password", response_model=StandardResponse[None])
async def forgot_password(
    data: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    # Token is generated internally. In production, this triggers an email dispatch.
    await service.request_password_reset(data.email)
    return StandardResponse(
        message="If this email is registered, you will receive instructions to reset your password.",
        data=None,
    )


@router.post("/reset-password", response_model=StandardResponse[None])
async def reset_password(
    data: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.confirm_password_reset(data.token, data.new_password)
    return StandardResponse(
        message="Password has been reset successfully. Please log in with your new password.",
        data=None,
    )


@router.post("/change-password", response_model=StandardResponse[None])
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.change_password(current_user, data.current_password, data.new_password)
    return StandardResponse(
        message="Password changed successfully. All other sessions have been logged out.",
        data=None,
    )


@router.get("/me", response_model=StandardResponse[UserResponse])
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return StandardResponse(
        message="Current user details retrieved",
        data=UserResponse.model_validate(current_user),
    )
