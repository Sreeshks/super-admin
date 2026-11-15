import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ConflictException, NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.models.subscriptions import SubscriptionPlan, TenantSubscription
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.subscriptions import (
    AssignSubscriptionRequest,
    SubscriptionPlanCreate,
    SubscriptionPlanResponse,
    SubscriptionPlanUpdate,
    TenantSubscriptionResponse,
)
from app.utils.slug import generate_slug

router = APIRouter(prefix="/subscriptions", tags=["Console - Subscriptions"])


@router.post("/plans", response_model=StandardResponse[SubscriptionPlanResponse], status_code=status.HTTP_201_CREATED)
async def create_plan(
    data: SubscriptionPlanCreate,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    slug = data.slug.strip() if data.slug else generate_slug(data.name)
    stmt = select(SubscriptionPlan).where(SubscriptionPlan.slug == slug)
    if (await db.execute(stmt)).scalars().first():
        raise ConflictException(f"Plan with slug '{slug}' already exists")

    plan_dict = data.model_dump()
    plan_dict["slug"] = slug
    plan = SubscriptionPlan(**plan_dict)
    db.add(plan)
    await db.commit()
    await db.refresh(plan)

    return StandardResponse(
        message="Subscription plan created successfully",
        data=SubscriptionPlanResponse.model_validate(plan),
    )


@router.get("/plans", response_model=StandardResponse[list[SubscriptionPlanResponse]])
async def list_plans(
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SubscriptionPlan).where(SubscriptionPlan.is_deleted == False).order_by(SubscriptionPlan.price.asc())
    plans = (await db.execute(stmt)).scalars().all()
    return StandardResponse(
        message="Subscription plans retrieved",
        data=[SubscriptionPlanResponse.model_validate(p) for p in plans],
    )


@router.put("/plans/{id}", response_model=StandardResponse[SubscriptionPlanResponse])
async def update_plan(
    id: uuid.UUID,
    data: SubscriptionPlanUpdate,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SubscriptionPlan).where(SubscriptionPlan.id == id, SubscriptionPlan.is_deleted == False)
    plan = (await db.execute(stmt)).scalars().first()
    if not plan:
        raise NotFoundException("Subscription plan not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(plan, k, v)

    await db.commit()
    await db.refresh(plan)
    return StandardResponse(
        message="Subscription plan updated successfully",
        data=SubscriptionPlanResponse.model_validate(plan),
    )


@router.post("/assign/{tenant_id}", response_model=StandardResponse[TenantSubscriptionResponse])
async def assign_subscription_plan(
    tenant_id: uuid.UUID,
    data: AssignSubscriptionRequest,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt_t = select(Tenant).where(Tenant.id == tenant_id, Tenant.is_deleted == False)
    if not (await db.execute(stmt_t)).scalars().first():
        raise NotFoundException("Tenant not found")

    stmt_p = select(SubscriptionPlan).where(SubscriptionPlan.id == data.plan_id, SubscriptionPlan.is_active == True)
    plan = (await db.execute(stmt_p)).scalars().first()
    if not plan:
        raise NotFoundException("Active subscription plan not found")

    stmt_sub = select(TenantSubscription).where(TenantSubscription.tenant_id == tenant_id)
    sub = (await db.execute(stmt_sub)).scalars().first()

    if sub:
        sub.plan_id = data.plan_id
        sub.status = data.status
    else:
        sub = TenantSubscription(tenant_id=tenant_id, plan_id=data.plan_id, status=data.status)
        db.add(sub)

    await db.commit()
    await db.refresh(sub)

    return StandardResponse(
        message="Subscription assigned successfully",
        data=TenantSubscriptionResponse.model_validate(sub),
    )
