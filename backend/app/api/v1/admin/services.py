import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.content import Service
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import (
    ServiceBulkDelete,
    ServiceBulkOrderUpdate,
    ServiceBulkStatusUpdate,
    ServiceCreate,
    ServiceResponse,
    ServiceUpdate,
)
from app.services.content_service import ContentService
from app.services.entitlement_service import EntitlementService

router = APIRouter(prefix="/services", tags=["Company Admin - Services"])


@router.get("", response_model=PaginatedResponse[ServiceResponse])
async def list_services(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    category_id: str | None = Query(None),
    status: str | None = Query(None),
    is_featured: bool | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    cat_uuid: uuid.UUID | None = None
    if category_id and category_id.strip():
        try:
            cat_uuid = uuid.UUID(category_id.strip())
        except ValueError:
            cat_uuid = None

    clean_search = search.strip() if search and search.strip() else None
    clean_status = status.strip() if status and status.strip() else None

    service = ContentService(db, tenant_id)
    items, pagination = await service.list_services(
        page=page,
        page_size=page_size,
        search=clean_search,
        category_id=cat_uuid,
        status=clean_status,
        is_featured=is_featured,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse(
        data=[ServiceResponse.model_validate(s) for s in items],
        pagination=pagination,
    )


@router.post("", response_model=StandardResponse[ServiceResponse], status_code=status.HTTP_201_CREATED)
async def create_service(
    data: ServiceCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    entitlement = EntitlementService(db, tenant_id)
    await entitlement.can_add_service()

    service = ContentService(db, tenant_id)
    created_service = await service.create_service(data)
    return StandardResponse(
        message="Service created successfully",
        data=ServiceResponse.model_validate(created_service),
    )


@router.get("/{id}", response_model=StandardResponse[ServiceResponse])
async def get_service(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(Service, db, tenant_id)
    service_item = await repo.get_by_id(id)
    if not service_item:
        raise NotFoundException("Service not found")
    return StandardResponse(
        message="Service retrieved",
        data=ServiceResponse.model_validate(service_item),
    )


@router.put("/{id}", response_model=StandardResponse[ServiceResponse])
async def update_service(
    id: uuid.UUID,
    data: ServiceUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    updated_service = await service.update_service(id, data)
    return StandardResponse(
        message="Service updated successfully",
        data=ServiceResponse.model_validate(updated_service),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_service(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_service(id)
    return StandardResponse(
        message="Service deleted successfully",
        data=None,
    )


@router.patch("/bulk/status", response_model=StandardResponse[dict])
async def bulk_update_status(
    data: ServiceBulkStatusUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    updated_count = await service.bulk_update_service_status(data)
    return StandardResponse(
        message=f"{updated_count} service(s) status updated",
        data={"updated_count": updated_count},
    )


@router.patch("/bulk/order", response_model=StandardResponse[None])
async def bulk_update_order(
    data: ServiceBulkOrderUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.bulk_update_service_order(data)
    return StandardResponse(
        message="Service display orders updated successfully",
        data=None,
    )


@router.post("/bulk/delete", response_model=StandardResponse[dict])
async def bulk_delete_services(
    data: ServiceBulkDelete,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    deleted_count = await service.bulk_delete_services(data.service_ids)
    return StandardResponse(
        message=f"{deleted_count} service(s) deleted successfully",
        data={"deleted_count": deleted_count},
    )
