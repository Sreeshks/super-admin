import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import BaseModel


class SubscriptionPlan(BaseModel):
    __tablename__ = "subscription_plans"

    name: Mapped[str] = mapped_column(String(100), nullable=False)  # FREE, BASIC, PREMIUM, ENTERPRISE
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    billing_cycle: Mapped[str] = mapped_column(String(30), default="monthly", nullable=False)  # monthly, yearly

    # Entitlements and Limits
    max_services: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    max_locations: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    max_storage_mb: Mapped[int] = mapped_column(Integer, default=500, nullable=False)
    max_admins: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    allow_custom_domain: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    subscriptions = relationship("TenantSubscription", back_populates="plan")


class TenantSubscription(BaseModel):
    __tablename__ = "tenant_subscriptions"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("subscription_plans.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(30), default="active", nullable=False
    )  # active, cancelled, expired, past_due
    current_period_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    tenant = relationship("Tenant", back_populates="subscription")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions", lazy="selectin")
