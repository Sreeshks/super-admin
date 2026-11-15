import uuid

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.content import Category
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.content_service import ContentService

router = APIRouter(prefix="/categories", tags=["Company Admin - Categories"])


class CategoryStatusPatch(BaseModel):
    status: str = Field(pattern="^(active|inactive)$")


@router.post("", response_model=StandardResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    category = await service.create_category(data)
    return StandardResponse(
        message="Category created successfully",
        data=CategoryResponse.model_validate(category),
    )


@router.get("", response_model=PaginatedResponse[CategoryResponse])
async def list_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    status: str | None = Query(None),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    items, pagination = await service.list_categories(
        page=page,
        page_size=page_size,
        search=search,
        status=status,
    )
    return PaginatedResponse(
        data=[CategoryResponse.model_validate(c) for c in items],
        pagination=pagination,
    )


@router.get("/{id}", response_model=StandardResponse[CategoryResponse])
async def get_category(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(Category, db, tenant_id)
    category = await repo.get_by_id(id)
    if not category:
        raise NotFoundException("Category not found")
    return StandardResponse(
        message="Category retrieved",
        data=CategoryResponse.model_validate(category),
    )


@router.put("/{id}", response_model=StandardResponse[CategoryResponse])
async def update_category(
    id: uuid.UUID,
    data: CategoryUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    category = await service.update_category(id, data)
    return StandardResponse(
        message="Category updated successfully",
        data=CategoryResponse.model_validate(category),
    )


@router.patch("/{id}/status", response_model=StandardResponse[CategoryResponse])
async def update_category_status(
    id: uuid.UUID,
    data: CategoryStatusPatch,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    category = await service.update_category(id, CategoryUpdate(status=data.status))
    return StandardResponse(
        message="Category status updated successfully",
        data=CategoryResponse.model_validate(category),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_category(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_category(id)
    return StandardResponse(
        message="Category deleted successfully",
        data=None,
    )
