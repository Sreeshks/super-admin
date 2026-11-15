import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.schemas.common import StandardResponse
from app.schemas.content import (
    InstagramPostCreate,
    InstagramPostResponse,
    InstagramPostUpdate,
)
from app.services.content_service import ContentService

router = APIRouter(prefix="/instagram", tags=["Company Admin - Instagram"])


@router.get("", response_model=StandardResponse[list[InstagramPostResponse]])
async def list_instagram_posts(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    posts = await service.list_instagram_posts()
    return StandardResponse(
        message="Instagram posts retrieved",
        data=[InstagramPostResponse.model_validate(p) for p in posts],
    )


@router.post("", response_model=StandardResponse[InstagramPostResponse], status_code=status.HTTP_201_CREATED)
async def create_instagram_post(
    data: InstagramPostCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    post = await service.create_instagram_post(data)
    return StandardResponse(
        message="Instagram post created successfully",
        data=InstagramPostResponse.model_validate(post),
    )


@router.put("/{id}", response_model=StandardResponse[InstagramPostResponse])
async def update_instagram_post(
    id: uuid.UUID,
    data: InstagramPostUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    post = await service.update_instagram_post(id, data)
    return StandardResponse(
        message="Instagram post updated successfully",
        data=InstagramPostResponse.model_validate(post),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_instagram_post(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_instagram_post(id)
    return StandardResponse(
        message="Instagram post deleted successfully",
        data=None,
    )
