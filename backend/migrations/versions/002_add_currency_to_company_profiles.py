"""add currency to company profiles

Revision ID: 002_add_currency
Revises: 001_initial
Create Date: 2026-11-15 18:10:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "002_add_currency"
down_revision: str | None = "001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "company_profiles",
        sa.Column("currency", sa.String(length=10), nullable=True, server_default="USD"),
    )


def downgrade() -> None:
    op.drop_column("company_profiles", "currency")
