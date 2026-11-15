import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.content import (
    ContactDetailsResponse,
    ContactDetailsUpdate,
    ContactEnquiryResponse,
    ContactEnquiryStatusUpdate,
)
from app.services.content_service import ContentService

router = APIRouter(prefix="/contact", tags=["Company Admin - Contact & Enquiries"])


@router.get("", response_model=StandardResponse[ContactDetailsResponse])
async def get_contact_details(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    details = await service.get_contact_details()
    return StandardResponse(
        message="Contact details retrieved",
        data=ContactDetailsResponse.model_validate(details),
    )


@router.put("", response_model=StandardResponse[ContactDetailsResponse])
async def update_contact_details(
    data: ContactDetailsUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    details = await service.update_contact_details(data)
    return StandardResponse(
        message="Contact details updated successfully",
        data=ContactDetailsResponse.model_validate(details),
    )


@router.get("/enquiries", response_model=PaginatedResponse[ContactEnquiryResponse])
async def list_enquiries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    items, pagination = await service.list_enquiries(
        page=page,
        page_size=page_size,
        status=status,
        search=search,
    )
    return PaginatedResponse(
        data=[ContactEnquiryResponse.model_validate(e) for e in items],
        pagination=pagination,
    )


@router.patch("/enquiries/{enquiry_id}/status", response_model=StandardResponse[ContactEnquiryResponse])
async def update_enquiry_status(
    enquiry_id: uuid.UUID,
    data: ContactEnquiryStatusUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.CONTENT_MANAGER, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = ContentService(db, tenant_id)
    enquiry = await service.update_enquiry_status(enquiry_id, data)
    return StandardResponse(
        message="Enquiry status updated successfully",
        data=ContactEnquiryResponse.model_validate(enquiry),
    )
