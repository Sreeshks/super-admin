import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.content import MediaAsset
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import StandardResponse
from app.schemas.content import MediaAssetCreateUrl, MediaAssetResponse
from app.services.media_service import MediaService

router = APIRouter(prefix="/media", tags=["Company Admin - Media"])


@router.get("", response_model=StandardResponse[list[MediaAssetResponse]])
async def list_media_assets(
    media_type: str | None = None,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(MediaAsset, db, tenant_id)
    filters = []
    if media_type:
        filters.append(MediaAsset.media_type == media_type)
    assets = await repo.list(
        filters=filters,
        order_by=MediaAsset.created_at.desc(),
        limit=500,
    )
    return StandardResponse(
        message="Media assets retrieved successfully",
        data=[MediaAssetResponse.model_validate(a) for a in assets],
    )


@router.post("/upload", response_model=StandardResponse[MediaAssetResponse], status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    media_type: str = Form(
        "general", description="logo, favicon, categories, services, offers, banners, blogs, testimonials, gallery"
    ),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = MediaService(db, tenant_id)
    asset = await service.upload_file(file, media_type=media_type)
    return StandardResponse(
        message="File uploaded and processed successfully",
        data=MediaAssetResponse.model_validate(asset),
    )


@router.post("/url", response_model=StandardResponse[MediaAssetResponse], status_code=status.HTTP_201_CREATED)
async def create_media_from_url(
    data: MediaAssetCreateUrl,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = MediaService(db, tenant_id)
    asset = await service.create_asset_from_url(
        url=data.file_url,
        original_name=data.original_name,
        media_type=data.media_type,
        label=data.label,
        file_size=data.file_size,
    )
    return StandardResponse(
        message="Media asset created successfully from ImgBB URL",
        data=MediaAssetResponse.model_validate(asset),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_media_asset(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = MediaService(db, tenant_id)
    await service.delete_asset(id)
    return StandardResponse(
        message="Media asset deleted successfully",
        data=None,
    )
