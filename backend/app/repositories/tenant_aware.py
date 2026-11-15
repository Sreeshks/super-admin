import builtins
import math
import uuid
from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import TenantScopedModel
from app.schemas.common import PaginationMeta

TenantModelType = TypeVar("TenantModelType", bound=TenantScopedModel)


class TenantAwareRepository(Generic[TenantModelType]):
    """
    Repository that guarantees strict multi-tenant isolation.
    Every query is unconditionally bounded by the tenant_id.
    """

    def __init__(self, model: type[TenantModelType], session: AsyncSession, tenant_id: uuid.UUID):
        self.model = model
        self.session = session
        self.tenant_id = tenant_id

    async def get_by_id(self, id: uuid.UUID, include_deleted: bool = False) -> TenantModelType | None:
        stmt = select(self.model).where(
            self.model.id == id,
            self.model.tenant_id == self.tenant_id,
        )
        if hasattr(self.model, "is_deleted") and not include_deleted:
            stmt = stmt.where(self.model.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list(
        self,
        filters: list[Any] | dict[str, Any] | None = None,
        order_by: Any | None = None,
        order_desc: bool = False,
        offset: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> Sequence[TenantModelType]:
        stmt = select(self.model).where(self.model.tenant_id == self.tenant_id)
        if hasattr(self.model, "is_deleted") and not include_deleted:
            stmt = stmt.where(self.model.is_deleted == False)
        if filters:
            if isinstance(filters, dict):
                for k, v in filters.items():
                    if hasattr(self.model, k):
                        stmt = stmt.where(getattr(self.model, k) == v)
            else:
                for condition in filters:
                    stmt = stmt.where(condition)
        if order_by is not None:
            if isinstance(order_by, str) and hasattr(self.model, order_by):
                col = getattr(self.model, order_by)
                stmt = stmt.order_by(col.desc() if order_desc else col.asc())
            elif hasattr(order_by, "desc") and order_desc:
                stmt = stmt.order_by(order_by.desc())
            else:
                stmt = stmt.order_by(order_by)
        stmt = stmt.offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count(self, filters: builtins.list[Any] | None = None, include_deleted: bool = False) -> int:
        stmt = select(func.count()).select_from(self.model).where(self.model.tenant_id == self.tenant_id)
        if hasattr(self.model, "is_deleted") and not include_deleted:
            stmt = stmt.where(self.model.is_deleted == False)
        if filters:
            for condition in filters:
                stmt = stmt.where(condition)
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def list_paginated(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: builtins.list[Any] | None = None,
        order_by: Any | None = None,
        include_deleted: bool = False,
    ) -> tuple[Sequence[TenantModelType], PaginationMeta]:
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

    async def create(self, entity: TenantModelType) -> TenantModelType:
        # Enforce tenant isolation on creation
        entity.tenant_id = self.tenant_id
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def update(self, entity: TenantModelType) -> TenantModelType:
        # Double check tenant identity before mutating
        if entity.tenant_id != self.tenant_id:
            raise ValueError("Cross-tenant mutation attempt blocked")
        await self.session.flush()
        return entity

    async def soft_delete(self, entity: TenantModelType) -> TenantModelType:
        if entity.tenant_id != self.tenant_id:
            raise ValueError("Cross-tenant deletion attempt blocked")
        if hasattr(entity, "soft_delete"):
            entity.soft_delete()
            await self.session.flush()
        else:
            await self.session.delete(entity)
            await self.session.flush()
        return entity
