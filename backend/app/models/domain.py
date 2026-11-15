from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import TenantScopedModel


class CustomDomain(TenantScopedModel):
    __tablename__ = "custom_domains"

    domain: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(30), default="pending", nullable=False
    )  # pending, verified, failed
    verification_token_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)  # active, inactive

    tenant = relationship("Tenant", back_populates="custom_domains")
