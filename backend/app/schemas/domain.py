import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CustomDomainCreate(BaseModel):
    domain: str = Field(min_length=3, max_length=255, pattern=r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    is_primary: bool = False


class CustomDomainVerifyResponse(BaseModel):
    domain: str
    verification_status: str
    verified: bool
    dns_txt_record: str


class CustomDomainResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    domain: str
    is_primary: bool
    verification_status: str
    verified_at: datetime | None = None
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
