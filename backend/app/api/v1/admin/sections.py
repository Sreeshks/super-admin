import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.schemas.common import StandardResponse
from app.schemas.content import (
    WebsiteSectionBatchUpdate,
    WebsiteSectionResponse,
    WebsiteSectionUpdate,
)
from app.services.content_service import ContentService

router = APIRouter(prefix="/sections", tags=["Company Admin - Website Sections"])


@router.get("", response_model=StandardResponse[list[WebsiteSectionResponse]])
async def list_sections(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    sections = await service.list_sections()
    return StandardResponse(
        message="Website sections configuration retrieved",
        data=[WebsiteSectionResponse.model_validate(s) for s in sections],
    )


@router.put("/batch", response_model=StandardResponse[list[WebsiteSectionResponse]])
async def batch_update_sections(
    data: WebsiteSectionBatchUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    updated = await service.batch_update_sections(data)
    return StandardResponse(
        message="Website sections updated successfully",
        data=[WebsiteSectionResponse.model_validate(s) for s in updated],
    )


@router.put("/{section_key}", response_model=StandardResponse[WebsiteSectionResponse])
async def update_section(
    section_key: str,
    data: WebsiteSectionUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    sec = await service.update_section(section_key, data)
    return StandardResponse(
        message=f"Section '{section_key}' updated successfully",
        data=WebsiteSectionResponse.model_validate(sec),
    )
