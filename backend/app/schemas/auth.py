import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class RoleResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    phone: str | None = None
    tenant_id: uuid.UUID | None = None
    is_active: bool
    roles: list[RoleResponse] = []
    last_login_at: datetime | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
