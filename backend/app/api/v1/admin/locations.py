import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import LocationCreate, LocationResponse, LocationUpdate
from app.services.content_service import ContentService
from app.services.entitlement_service import EntitlementService

router = APIRouter(prefix="/locations", tags=["Company Admin - Locations"])


@router.get("", response_model=PaginatedResponse[LocationResponse])
async def list_locations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    items, pagination = await service.list_locations(page=page, page_size=page_size)
    return PaginatedResponse(
        data=[LocationResponse.model_validate(l) for l in items],
        pagination=pagination,
    )


@router.post("", response_model=StandardResponse[LocationResponse], status_code=status.HTTP_201_CREATED)
async def create_location(
    data: LocationCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    entitlement = EntitlementService(db, tenant_id)
    await entitlement.can_add_location()

    service = ContentService(db, tenant_id)
    loc = await service.create_location(data)
    return StandardResponse(
        message="Location created successfully",
        data=LocationResponse.model_validate(loc),
    )


@router.put("/{id}", response_model=StandardResponse[LocationResponse])
async def update_location(
    id: uuid.UUID,
    data: LocationUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    loc = await service.update_location(id, data)
    return StandardResponse(
        message="Location updated successfully",
        data=LocationResponse.model_validate(loc),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_location(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_location(id)
    return StandardResponse(
        message="Location deleted successfully",
        data=None,
    )
