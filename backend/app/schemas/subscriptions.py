import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubscriptionPlanBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slug: str | None = None
    description: str | None = None
    price: float = Field(ge=0)
    billing_cycle: str = Field(default="monthly", pattern="^(monthly|yearly)$")
    max_services: int = Field(ge=1, default=50)
    max_locations: int = Field(ge=1, default=1)
    max_storage_mb: int = Field(ge=10, default=500)
    max_admins: int = Field(ge=1, default=2)
    allow_custom_domain: bool = False
    is_active: bool = True


class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass


class SubscriptionPlanUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    slug: str | None = None
    description: str | None = None
    price: float | None = Field(None, ge=0)
    billing_cycle: str | None = Field(None, pattern="^(monthly|yearly)$")
    max_services: int | None = Field(None, ge=1)
    max_locations: int | None = Field(None, ge=1)
    max_storage_mb: int | None = Field(None, ge=10)
    max_admins: int | None = Field(None, ge=1)
    allow_custom_domain: bool | None = None
    is_active: bool | None = None


class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: uuid.UUID
    slug: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TenantSubscriptionResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    plan_id: uuid.UUID
    status: str
    current_period_start: datetime
    current_period_end: datetime | None = None
    plan: SubscriptionPlanResponse | None = None
    model_config = ConfigDict(from_attributes=True)


class AssignSubscriptionRequest(BaseModel):
    plan_id: uuid.UUID
    status: str = Field(default="active", pattern="^(active|cancelled|expired|past_due)$")
