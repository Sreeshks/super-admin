import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.schemas.common import StandardResponse
from app.schemas.content import (
    YouTubeVideoCreate,
    YouTubeVideoResponse,
    YouTubeVideoUpdate,
)
from app.services.content_service import ContentService

router = APIRouter(prefix="/youtube", tags=["Company Admin - YouTube Videos"])


@router.get("", response_model=StandardResponse[list[YouTubeVideoResponse]])
async def list_youtube_videos(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    videos = await service.list_youtube_videos()
    return StandardResponse(
        message="YouTube videos retrieved",
        data=[YouTubeVideoResponse.model_validate(v) for v in videos],
    )


@router.post("", response_model=StandardResponse[YouTubeVideoResponse], status_code=status.HTTP_201_CREATED)
async def create_youtube_video(
    data: YouTubeVideoCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    video = await service.create_youtube_video(data)
    return StandardResponse(
        message="YouTube video added successfully",
        data=YouTubeVideoResponse.model_validate(video),
    )


@router.put("/{id}", response_model=StandardResponse[YouTubeVideoResponse])
async def update_youtube_video(
    id: uuid.UUID,
    data: YouTubeVideoUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    video = await service.update_youtube_video(id, data)
    return StandardResponse(
        message="YouTube video updated successfully",
        data=YouTubeVideoResponse.model_validate(video),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_youtube_video(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_youtube_video(id)
    return StandardResponse(
        message="YouTube video deleted successfully",
        data=None,
    )
