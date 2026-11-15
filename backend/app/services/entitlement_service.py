import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException
from app.models.content import Location, Service
from app.models.subscriptions import SubscriptionPlan, TenantSubscription


class EntitlementService:
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def get_active_plan(self) -> SubscriptionPlan:
        stmt = (
            select(SubscriptionPlan)
            .join(TenantSubscription, TenantSubscription.plan_id == SubscriptionPlan.id)
            .where(
                TenantSubscription.tenant_id == self.tenant_id,
                TenantSubscription.status == "active",
            )
        )
        res = await self.db.execute(stmt)
        plan = res.scalars().first()
        if not plan:
            # Fallback default limits
            return SubscriptionPlan(
                name="DEFAULT",
                slug="default",
                price=0,
                max_services=100,
                max_locations=2,
                max_storage_mb=500,
                allow_custom_domain=False,
            )
        return plan

    async def can_add_service(self) -> None:
        plan = await self.get_active_plan()
        stmt = select(func.count(Service.id)).where(
            Service.tenant_id == self.tenant_id,
            Service.is_deleted == False,
        )
        count = (await self.db.execute(stmt)).scalar() or 0
        if count >= plan.max_services:
            raise ForbiddenException(
                f"Service limit reached ({plan.max_services}). Please upgrade your subscription plan."
            )

    async def can_add_location(self) -> None:
        plan = await self.get_active_plan()
        stmt = select(func.count(Location.id)).where(
            Location.tenant_id == self.tenant_id,
            Location.is_deleted == False,
        )
        count = (await self.db.execute(stmt)).scalar() or 0
        if count >= plan.max_locations:
            raise ForbiddenException(
                f"Location limit reached ({plan.max_locations}). Please upgrade your subscription plan."
            )

    async def can_use_custom_domain(self) -> None:
        plan = await self.get_active_plan()
        if not plan.allow_custom_domain:
            raise ForbiddenException("Custom domains are not permitted on your current subscription plan.")
