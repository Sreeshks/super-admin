from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.models.audit import AuditLog
from app.models.business_type import BusinessType
from app.models.tenant import Tenant
from app.models.user import Role, User, user_roles
from app.schemas.common import StandardResponse
from app.schemas.tenant import CompanyResponse

router = APIRouter(prefix="/dashboard", tags=["Console - Dashboard"])


@router.get("/stats", response_model=StandardResponse[dict[str, Any]])
async def get_dashboard_stats(
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    # Total companies
    total_companies = (await db.execute(select(func.count(Tenant.id)).where(Tenant.is_deleted == False))).scalar() or 0
    active_companies = (
        await db.execute(
            select(func.count(Tenant.id)).where(Tenant.account_status == "active", Tenant.is_deleted == False)
        )
    ).scalar() or 0
    inactive_companies = (
        await db.execute(
            select(func.count(Tenant.id)).where(Tenant.account_status != "active", Tenant.is_deleted == False)
        )
    ).scalar() or 0

    # Total business types
    total_business_types = (
        await db.execute(select(func.count(BusinessType.id)).where(BusinessType.is_deleted == False))
    ).scalar() or 0

    # Total administrators
    stmt_admins = (
        select(func.count(User.id))
        .join(user_roles, user_roles.c.user_id == User.id)
        .join(Role, Role.id == user_roles.c.role_id)
        .where(Role.name.in_([RoleEnum.COMPANY_ADMIN.value, RoleEnum.SUPER_ADMIN.value]), User.is_deleted == False)
    )
    total_administrators = (await db.execute(stmt_admins)).scalar() or 0

    # Recently registered companies (last 5)
    stmt_recent = (
        select(Tenant)
        .where(Tenant.is_deleted == False)
        .order_by(Tenant.created_at.desc())
        .limit(5)
    )
    recent_companies = (await db.execute(stmt_recent)).scalars().all()

    # Companies grouped by business type
    stmt_grouped = (
        select(BusinessType.name, func.count(Tenant.id))
        .join(Tenant, Tenant.business_type_id == BusinessType.id)
        .where(Tenant.is_deleted == False, BusinessType.is_deleted == False)
        .group_by(BusinessType.name)
    )
    grouped_res = (await db.execute(stmt_grouped)).all()
    grouped_by_type = {row[0]: row[1] for row in grouped_res}

    stats = {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "inactive_companies": inactive_companies,
        "total_business_types": total_business_types,
        "total_administrators": total_administrators,
        "recently_registered_companies": [CompanyResponse.model_validate(c) for c in recent_companies],
        "companies_by_business_type": grouped_by_type,
    }

    return StandardResponse(
        message="Dashboard statistics calculated successfully",
        data=stats,
    )


@router.get("/recent-activity", response_model=StandardResponse[list[dict[str, Any]]])
async def get_recent_activity(
    limit: int = 20,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(min(limit, 100))
    logs = (await db.execute(stmt)).scalars().all()

    data = [
        {
            "id": str(log.id),
            "tenant_id": str(log.tenant_id) if log.tenant_id else None,
            "user_id": str(log.user_id) if log.user_id else None,
            "action": log.action,
            "entity_name": log.entity_name,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]

    return StandardResponse(
        message="Recent platform activity retrieved successfully",
        data=data,
    )
