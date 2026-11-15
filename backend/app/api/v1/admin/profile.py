import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.schemas.common import StandardResponse
from app.schemas.content import CompanyProfileResponse, CompanyProfileUpdate
from app.services.content_service import ContentService

router = APIRouter(prefix="/profile", tags=["Company Admin - Profile"])


@router.get("", response_model=StandardResponse[CompanyProfileResponse])
async def get_profile(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    profile = await service.get_profile()
    return StandardResponse(
        message="Profile retrieved",
        data=CompanyProfileResponse.model_validate(profile),
    )


@router.put("", response_model=StandardResponse[CompanyProfileResponse])
async def update_profile(
    data: CompanyProfileUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    profile = await service.update_profile(data)
    return StandardResponse(
        message="Profile updated successfully",
        data=CompanyProfileResponse.model_validate(profile),
    )
