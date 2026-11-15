import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.content import Offer
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import OfferCreate, OfferResponse, OfferUpdate
from app.services.content_service import ContentService

router = APIRouter(prefix="/offers", tags=["Company Admin - Offers"])


@router.get("", response_model=PaginatedResponse[OfferResponse])
async def list_offers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, description="active, scheduled, or expired"),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    items, pagination = await service.list_offers(page=page, page_size=page_size, status_filter=status_filter)
    return PaginatedResponse(
        data=[OfferResponse.model_validate(o) for o in items],
        pagination=pagination,
    )


@router.post("", response_model=StandardResponse[OfferResponse], status_code=status.HTTP_201_CREATED)
async def create_offer(
    data: OfferCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    offer = await service.create_offer(data)
    return StandardResponse(
        message="Offer created successfully",
        data=OfferResponse.model_validate(offer),
    )


@router.get("/{id}", response_model=StandardResponse[OfferResponse])
async def get_offer(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(Offer, db, tenant_id)
    offer = await repo.get_by_id(id)
    if not offer:
        raise NotFoundException("Offer not found")
    return StandardResponse(
        message="Offer retrieved",
        data=OfferResponse.model_validate(offer),
    )


@router.put("/{id}", response_model=StandardResponse[OfferResponse])
async def update_offer(
    id: uuid.UUID,
    data: OfferUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    offer = await service.update_offer(id, data)
    return StandardResponse(
        message="Offer updated successfully",
        data=OfferResponse.model_validate(offer),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_offer(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    await service.delete_offer(id)
    return StandardResponse(
        message="Offer deleted successfully",
        data=None,
    )
