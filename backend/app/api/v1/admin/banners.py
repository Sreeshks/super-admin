import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.content import Banner
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import StandardResponse
from app.schemas.content import BannerCreate, BannerResponse, BannerUpdate
from app.services.content_service import ContentService

router = APIRouter(prefix="/banners", tags=["Company Admin - Hero Banners"])


@router.get("", response_model=StandardResponse[list[BannerResponse]])
async def list_banners(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    banners = await service.list_banners()
    return StandardResponse(
        message="Hero banners retrieved",
        data=[BannerResponse.model_validate(b) for b in banners],
    )


@router.post("", response_model=StandardResponse[BannerResponse], status_code=status.HTTP_201_CREATED)
async def create_banner(
    data: BannerCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    banner = await service.create_banner(data)
    return StandardResponse(
        message="Banner created successfully",
        data=BannerResponse.model_validate(banner),
    )


@router.get("/{id}", response_model=StandardResponse[BannerResponse])
async def get_banner(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(Banner, db, tenant_id)
    banner = await repo.get_by_id(id)
    if not banner:
        raise NotFoundException("Banner not found")
    return StandardResponse(
        message="Banner retrieved",
        data=BannerResponse.model_validate(banner),
    )


@router.put("/{id}", response_model=StandardResponse[BannerResponse])
async def update_banner(
    id: uuid.UUID,
    data: BannerUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    banner = await service.update_banner(id, data)
    return StandardResponse(
        message="Banner updated successfully",
        data=BannerResponse.model_validate(banner),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_banner(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_banner(id)
    return StandardResponse(
        message="Banner deleted successfully",
        data=None,
    )
