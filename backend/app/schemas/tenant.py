import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.business_type import BusinessTypeResponse


class CompanyCreate(BaseModel):
    # Company details
    company_name: str = Field(min_length=2, max_length=200)
    slug: str | None = Field(None, max_length=100)
    business_type_id: uuid.UUID
    logo: str | None = None
    favicon: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    description: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = "India"
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    website_status: str = Field(default="active", pattern="^(active|maintenance|disabled)$")
    account_status: str = Field(default="active", pattern="^(active|suspended|trial)$")

    # Initial Company Admin details
    admin_name: str = Field(min_length=2, max_length=150)
    admin_email: EmailStr
    initial_password: str = Field(min_length=8)


class CompanyUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    slug: str | None = None
    business_type_id: uuid.UUID | None = None
    website_status: str | None = Field(None, pattern="^(active|maintenance|disabled)$")
    account_status: str | None = Field(None, pattern="^(active|suspended|trial)$")


class CompanyStatusUpdate(BaseModel):
    website_status: str | None = Field(None, pattern="^(active|maintenance|disabled)$")
    account_status: str | None = Field(None, pattern="^(active|suspended|trial)$")


class CompanyResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    business_type_id: uuid.UUID
    business_type: BusinessTypeResponse | None = None
    website_status: str
    account_status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CompanyCreateResponse(BaseModel):
    company: CompanyResponse
    admin_user_id: uuid.UUID
    admin_email: str
    admin_name: str
    temporary_credentials_note: str = "Please store the initial password securely; it cannot be retrieved again."
