import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.content import FAQ
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import FAQCreate, FAQResponse, FAQUpdate
from app.services.content_service import ContentService

router = APIRouter(prefix="/faqs", tags=["Company Admin - FAQs"])


@router.get("", response_model=PaginatedResponse[FAQResponse])
async def list_faqs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    items, pagination = await service.list_faqs(page=page, page_size=page_size)
    return PaginatedResponse(
        data=[FAQResponse.model_validate(f) for f in items],
        pagination=pagination,
    )


@router.post("", response_model=StandardResponse[FAQResponse], status_code=status.HTTP_201_CREATED)
async def create_faq(
    data: FAQCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    faq = await service.create_faq(data)
    return StandardResponse(
        message="FAQ created successfully",
        data=FAQResponse.model_validate(faq),
    )


@router.get("/{id}", response_model=StandardResponse[FAQResponse])
async def get_faq(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(FAQ, db, tenant_id)
    faq = await repo.get_by_id(id)
    if not faq:
        raise NotFoundException("FAQ not found")
    return StandardResponse(
        message="FAQ retrieved",
        data=FAQResponse.model_validate(faq),
    )


@router.put("/{id}", response_model=StandardResponse[FAQResponse])
async def update_faq(
    id: uuid.UUID,
    data: FAQUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    faq = await service.update_faq(id, data)
    return StandardResponse(
        message="FAQ updated successfully",
        data=FAQResponse.model_validate(faq),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_faq(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_faq(id)
    return StandardResponse(
        message="FAQ deleted successfully",
        data=None,
    )
