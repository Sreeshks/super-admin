import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.content import Testimonial
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import (
    TestimonialCreate,
    TestimonialResponse,
    TestimonialUpdate,
)
from app.services.content_service import ContentService

router = APIRouter(prefix="/testimonials", tags=["Company Admin - Testimonials"])


@router.get("", response_model=PaginatedResponse[TestimonialResponse])
async def list_testimonials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    items, pagination = await service.list_testimonials(page=page, page_size=page_size)
    return PaginatedResponse(
        data=[TestimonialResponse.model_validate(t) for t in items],
        pagination=pagination,
    )


@router.post("", response_model=StandardResponse[TestimonialResponse], status_code=status.HTTP_201_CREATED)
async def create_testimonial(
    data: TestimonialCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    testim = await service.create_testimonial(data)
    return StandardResponse(
        message="Testimonial added successfully",
        data=TestimonialResponse.model_validate(testim),
    )


@router.get("/{id}", response_model=StandardResponse[TestimonialResponse])
async def get_testimonial(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(Testimonial, db, tenant_id)
    testim = await repo.get_by_id(id)
    if not testim:
        raise NotFoundException("Testimonial not found")
    return StandardResponse(
        message="Testimonial retrieved",
        data=TestimonialResponse.model_validate(testim),
    )


@router.put("/{id}", response_model=StandardResponse[TestimonialResponse])
async def update_testimonial(
    id: uuid.UUID,
    data: TestimonialUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    testim = await service.update_testimonial(id, data)
    return StandardResponse(
        message="Testimonial updated successfully",
        data=TestimonialResponse.model_validate(testim),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_testimonial(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_testimonial(id)
    return StandardResponse(
        message="Testimonial deleted successfully",
        data=None,
    )
