import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.schemas.common import StandardResponse
from app.schemas.content import (
    SocialLinkCreate,
    SocialLinkResponse,
    SocialLinkUpdate,
)
from app.services.content_service import ContentService

router = APIRouter(prefix="/social-links", tags=["Company Admin - Social Links"])


@router.get("", response_model=StandardResponse[list[SocialLinkResponse]])
async def list_social_links(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    links = await service.list_social_links()
    return StandardResponse(
        message="Social links retrieved",
        data=[SocialLinkResponse.model_validate(l) for l in links],
    )


@router.post("", response_model=StandardResponse[SocialLinkResponse], status_code=status.HTTP_201_CREATED)
async def create_social_link(
    data: SocialLinkCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    link = await service.create_social_link(data)
    return StandardResponse(
        message="Social link added successfully",
        data=SocialLinkResponse.model_validate(link),
    )


@router.put("/{id}", response_model=StandardResponse[SocialLinkResponse])
async def update_social_link(
    id: uuid.UUID,
    data: SocialLinkUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    link = await service.update_social_link(id, data)
    return StandardResponse(
        message="Social link updated successfully",
        data=SocialLinkResponse.model_validate(link),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_social_link(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_social_link(id)
    return StandardResponse(
        message="Social link deleted successfully",
        data=None,
    )
