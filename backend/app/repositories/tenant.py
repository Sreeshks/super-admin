import math
from collections.abc import Sequence
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business_type import BusinessType
from app.models.domain import CustomDomain
from app.models.tenant import Tenant
from app.repositories.base import BaseRepository
from app.schemas.common import PaginationMeta


class TenantRepository(BaseRepository[Tenant]):
    def __init__(self, session: AsyncSession):
        super().__init__(Tenant, session)

    async def get_by_slug(self, slug: str, include_deleted: bool = False) -> Tenant | None:
        stmt = select(Tenant).where(Tenant.slug == slug)
        if not include_deleted:
            stmt = stmt.where(Tenant.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_verified_domain(self, domain: str) -> Tenant | None:
        stmt = (
            select(Tenant)
            .join(CustomDomain, CustomDomain.tenant_id == Tenant.id)
            .where(
                CustomDomain.domain == domain,
                CustomDomain.verification_status == "verified",
                CustomDomain.status == "active",
                Tenant.is_deleted == False,
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list_paginated(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: list[Any] | None = None,
        order_by: Any | None = None,
        include_deleted: bool = False,
    ) -> tuple[Sequence[Tenant], PaginationMeta]:
        page = max(1, page)
        page_size = min(max(1, page_size), 100)
        offset = (page - 1) * page_size

        total_items = await self.count(filters=filters, include_deleted=include_deleted)
        total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0

        items = await self.list(
            filters=filters,
            order_by=order_by,
            offset=offset,
            limit=page_size,
            include_deleted=include_deleted,
        )

        pagination = PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_previous=page > 1,
        )
        return items, pagination


class BusinessTypeRepository(BaseRepository[BusinessType]):
    def __init__(self, session: AsyncSession):
        super().__init__(BusinessType, session)

    async def get_by_slug(self, slug: str) -> BusinessType | None:
        stmt = select(BusinessType).where(BusinessType.slug == slug, BusinessType.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalars().first()
