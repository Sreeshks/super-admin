import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.models.business_type import BusinessType
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.business_type import (
    BusinessTypeCreate,
    BusinessTypeResponse,
    BusinessTypeUpdate,
)
from app.schemas.common import StandardResponse
from app.utils.slug import generate_slug

router = APIRouter(prefix="/business-types", tags=["Console - Business Types"])


@router.post("", response_model=StandardResponse[BusinessTypeResponse], status_code=status.HTTP_201_CREATED)
async def create_business_type(
    data: BusinessTypeCreate,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    slug = data.slug.strip() if data.slug else generate_slug(data.name)
    stmt = select(BusinessType).where(BusinessType.slug == slug, BusinessType.is_deleted == False)
    if (await db.execute(stmt)).scalars().first():
        raise ConflictException(f"Business type with slug '{slug}' already exists")

    bt_dict = data.model_dump()
    bt_dict["slug"] = slug
    bt = BusinessType(**bt_dict)
    db.add(bt)
    await db.commit()
    await db.refresh(bt)

    return StandardResponse(
        message="Business type created successfully",
        data=BusinessTypeResponse.model_validate(bt),
    )


@router.get("", response_model=StandardResponse[list[BusinessTypeResponse]])
async def list_business_types(
    status: str | None = Query(None),
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BusinessType).where(BusinessType.is_deleted == False)
    if status:
        stmt = stmt.where(BusinessType.status == status)
    stmt = stmt.order_by(BusinessType.name.asc())
    items = (await db.execute(stmt)).scalars().all()

    return StandardResponse(
        message="Business types retrieved successfully",
        data=[BusinessTypeResponse.model_validate(b) for b in items],
    )


@router.get("/{id}", response_model=StandardResponse[BusinessTypeResponse])
async def get_business_type(
    id: uuid.UUID,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BusinessType).where(BusinessType.id == id, BusinessType.is_deleted == False)
    bt = (await db.execute(stmt)).scalars().first()
    if not bt:
        raise NotFoundException("Business type not found")

    return StandardResponse(
        message="Business type retrieved successfully",
        data=BusinessTypeResponse.model_validate(bt),
    )


@router.put("/{id}", response_model=StandardResponse[BusinessTypeResponse])
async def update_business_type(
    id: uuid.UUID,
    data: BusinessTypeUpdate,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BusinessType).where(BusinessType.id == id, BusinessType.is_deleted == False)
    bt = (await db.execute(stmt)).scalars().first()
    if not bt:
        raise NotFoundException("Business type not found")

    update_dict = data.model_dump(exclude_unset=True)
    if update_dict.get("slug"):
        slug = generate_slug(update_dict["slug"])
        stmt_check = select(BusinessType).where(
            BusinessType.slug == slug,
            BusinessType.id != id,
            BusinessType.is_deleted == False,
        )
        if (await db.execute(stmt_check)).scalars().first():
            raise ConflictException(f"Slug '{slug}' is already taken")
        update_dict["slug"] = slug

    for k, v in update_dict.items():
        setattr(bt, k, v)

    await db.commit()
    await db.refresh(bt)
    return StandardResponse(
        message="Business type updated successfully",
        data=BusinessTypeResponse.model_validate(bt),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_business_type(
    id: uuid.UUID,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BusinessType).where(BusinessType.id == id, BusinessType.is_deleted == False)
    bt = (await db.execute(stmt)).scalars().first()
    if not bt:
        raise NotFoundException("Business type not found")

    # Check if used by any tenants
    stmt_usage = select(func.count(Tenant.id)).where(Tenant.business_type_id == id, Tenant.is_deleted == False)
    used_count = (await db.execute(stmt_usage)).scalar() or 0
    if used_count > 0:
        raise BadRequestException(f"Cannot delete business type: It is used by {used_count} active business(es).")

    bt.soft_delete()
    await db.commit()
    return StandardResponse(
        message="Business type deleted successfully",
        data=None,
    )
