import builtins
import uuid
from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: uuid.UUID, include_deleted: bool = False) -> ModelType | None:
        stmt = select(self.model).where(self.model.id == id)
        if hasattr(self.model, "is_deleted") and not include_deleted:
            stmt = stmt.where(self.model.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list(
        self,
        filters: list[Any] | None = None,
        order_by: Any | None = None,
        offset: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> Sequence[ModelType]:
        stmt = select(self.model)
        if hasattr(self.model, "is_deleted") and not include_deleted:
            stmt = stmt.where(self.model.is_deleted == False)
        if filters:
            for condition in filters:
                stmt = stmt.where(condition)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        stmt = stmt.offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count(self, filters: builtins.list[Any] | None = None, include_deleted: bool = False) -> int:
        stmt = select(func.count()).select_from(self.model)
        if hasattr(self.model, "is_deleted") and not include_deleted:
            stmt = stmt.where(self.model.is_deleted == False)
        if filters:
            for condition in filters:
                stmt = stmt.where(condition)
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def create(self, entity: ModelType) -> ModelType:
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def update(self, entity: ModelType) -> ModelType:
        await self.session.flush()
        return entity

    async def soft_delete(self, entity: ModelType) -> ModelType:
        if hasattr(entity, "soft_delete"):
            entity.soft_delete()
            await self.session.flush()
        else:
            await self.session.delete(entity)
            await self.session.flush()
        return entity

    async def hard_delete(self, entity: ModelType) -> None:
        await self.session.delete(entity)
        await self.session.flush()
