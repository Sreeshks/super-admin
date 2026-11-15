import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class BusinessTypeBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slug: str | None = Field(None, max_length=100)
    description: str | None = None
    image: str | None = None
    default_configuration: dict[str, Any] | None = Field(default_factory=dict)
    status: str = Field(default="active", pattern="^(active|inactive)$")


class BusinessTypeCreate(BusinessTypeBase):
    name: str


class BusinessTypeUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    slug: str | None = None
    description: str | None = None
    image: str | None = None
    default_configuration: dict[str, Any] | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class BusinessTypeResponse(BusinessTypeBase):
    id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
