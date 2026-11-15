
from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import BaseModel


class BusinessType(BaseModel):
    __tablename__ = "business_types"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    default_configuration: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False, index=True)

    # Relationships
    tenants = relationship("Tenant", back_populates="business_type", lazy="selectin")
