import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.permissions import RoleEnum
from app.core.security import hash_password
from app.dependencies.auth import require_roles
from app.models.tenant import Tenant
from app.models.user import Role, User, user_roles
from app.schemas.auth import UserResponse
from app.schemas.common import PaginatedResponse, StandardResponse

router = APIRouter(prefix="/administrators", tags=["Console - Administrators"])


class AdminListItem(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    phone: str | None = None
    tenant_id: uuid.UUID | None = None
    company_name: str | None = None
    is_active: bool
    roles: list[str] = []
    created_at: str


class StatusUpdatePayload(BaseModel):
    is_active: bool


class ResetPasswordPayload(BaseModel):
    new_password: str


@router.get("", response_model=PaginatedResponse[AdminListItem])
async def list_administrators(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    role: str | None = Query(None),
    status: str | None = Query(None),
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(User, Tenant.name.label("company_name"))
        .outerjoin(Tenant, Tenant.id == User.tenant_id)
        .where(User.is_deleted == False)
    )

    if search:
        search_fmt = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            func.lower(User.email).like(search_fmt) | func.lower(User.full_name).like(search_fmt)
        )

    if status == "active":
        stmt = stmt.where(User.is_active == True)
    elif status == "inactive":
        stmt = stmt.where(User.is_active == False)

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_items = (await db.execute(count_stmt)).scalar() or 0

    stmt = stmt.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    results = (await db.execute(stmt)).all()

    items = []
    for user_obj, comp_name in results:
        # Load user roles
        role_stmt = select(Role.name).join(user_roles, user_roles.c.role_id == Role.id).where(user_roles.c.user_id == user_obj.id)
        role_names = (await db.execute(role_stmt)).scalars().all()
        
        if role and role not in role_names:
            continue

        items.append(
            AdminListItem(
                id=user_obj.id,
                email=user_obj.email,
                full_name=user_obj.full_name,
                phone=user_obj.phone,
                tenant_id=user_obj.tenant_id,
                company_name=comp_name,
                is_active=user_obj.is_active,
                roles=list(role_names),
                created_at=user_obj.created_at.isoformat(),
            )
        )

    total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 1

    return PaginatedResponse(
        data=items,
        pagination={
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        },
    )


@router.patch("/{user_id}/status", response_model=StandardResponse[dict[str, Any]])
async def update_admin_status(
    user_id: uuid.UUID,
    payload: StatusUpdatePayload,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id, User.is_deleted == False)
    target_user = (await db.execute(stmt)).scalars().first()
    if not target_user:
        raise NotFoundException(f"Administrator with id '{user_id}' not found")

    target_user.is_active = payload.is_active
    await db.commit()
    await db.refresh(target_user)

    return StandardResponse(
        message=f"Administrator status updated to {'active' if target_user.is_active else 'inactive'}",
        data={"id": str(target_user.id), "is_active": target_user.is_active},
    )


@router.post("/{user_id}/reset-password", response_model=StandardResponse[dict[str, Any]])
async def reset_admin_password(
    user_id: uuid.UUID,
    payload: ResetPasswordPayload,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id, User.is_deleted == False)
    target_user = (await db.execute(stmt)).scalars().first()
    if not target_user:
        raise NotFoundException(f"Administrator with id '{user_id}' not found")

    target_user.password_hash = hash_password(payload.new_password)
    target_user.token_version += 1  # Revoke all sessions
    await db.commit()

    return StandardResponse(
        message="Password reset successfully. User sessions have been invalidated.",
        data={"id": str(target_user.id), "email": target_user.email},
    )
