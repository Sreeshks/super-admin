import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.content import Blog
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import BlogCreate, BlogResponse, BlogUpdate
from app.services.content_service import ContentService

router = APIRouter(prefix="/blogs", tags=["Company Admin - Blogs"])


@router.get("", response_model=PaginatedResponse[BlogResponse])
async def list_blogs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    items, pagination = await service.list_blogs(
        page=page,
        page_size=page_size,
        status=status,
        search=search,
    )
    return PaginatedResponse(
        data=[BlogResponse.model_validate(b) for b in items],
        pagination=pagination,
    )


@router.post("", response_model=StandardResponse[BlogResponse], status_code=status.HTTP_201_CREATED)
async def create_blog(
    data: BlogCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    blog = await service.create_blog(data)
    return StandardResponse(
        message="Blog article created successfully",
        data=BlogResponse.model_validate(blog),
    )


@router.get("/{id}", response_model=StandardResponse[BlogResponse])
async def get_blog(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(Blog, db, tenant_id)
    blog = await repo.get_by_id(id)
    if not blog:
        raise NotFoundException("Blog not found")
    return StandardResponse(
        message="Blog retrieved",
        data=BlogResponse.model_validate(blog),
    )


@router.put("/{id}", response_model=StandardResponse[BlogResponse])
async def update_blog(
    id: uuid.UUID,
    data: BlogUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    blog = await service.update_blog(id, data)
    return StandardResponse(
        message="Blog updated successfully",
        data=BlogResponse.model_validate(blog),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_blog(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_blog(id)
    return StandardResponse(
        message="Blog deleted/archived successfully",
        data=None,
    )
