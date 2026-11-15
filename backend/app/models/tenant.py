import uuid

from sqlalchemy import ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import BaseModel


class Tenant(BaseModel):
    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    business_type_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("business_types.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    website_status: Mapped[str] = mapped_column(
        String(30), default="active", nullable=False
    )  # active, maintenance, disabled
    account_status: Mapped[str] = mapped_column(
        String(30), default="active", nullable=False
    )  # active, suspended, trial

    # Relationships
    business_type = relationship("BusinessType", back_populates="tenants", lazy="selectin")
    users = relationship("User", back_populates="tenant", lazy="selectin", cascade="all, delete-orphan")
    profile = relationship(
        "CompanyProfile", back_populates="tenant", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    locations = relationship("Location", back_populates="tenant", lazy="selectin", cascade="all, delete-orphan")
    sections = relationship("WebsiteSection", back_populates="tenant", lazy="selectin", cascade="all, delete-orphan")
    custom_domains = relationship(
        "CustomDomain", back_populates="tenant", lazy="selectin", cascade="all, delete-orphan"
    )
    contact_details = relationship(
        "ContactDetails", back_populates="tenant", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
    subscription = relationship(
        "TenantSubscription", back_populates="tenant", uselist=False, lazy="selectin", cascade="all, delete-orphan"
    )
