import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import RoleEnum
from app.dependencies.auth import require_roles
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.tenant import (
    CompanyCreate,
    CompanyCreateResponse,
    CompanyResponse,
    CompanyStatusUpdate,
    CompanyUpdate,
)
from app.services.tenant_service import TenantService

router = APIRouter(prefix="/companies", tags=["Console - Companies"])


@router.post("", response_model=StandardResponse[CompanyCreateResponse], status_code=status.HTTP_201_CREATED)
async def create_company(
    data: CompanyCreate,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = TenantService(db)
    result = await service.create_company(data, creator_id=current_user.id)
    return StandardResponse(
        message="Company created successfully with initial administrator credentials",
        data=result,
    )


@router.get("", response_model=PaginatedResponse[CompanyResponse])
async def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    business_type_id: str | None = Query(None),
    status: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    bt_uuid: uuid.UUID | None = None
    if business_type_id and business_type_id.strip():
        try:
            bt_uuid = uuid.UUID(business_type_id.strip())
        except ValueError:
            bt_uuid = None

    clean_search = search.strip() if search and search.strip() else None
    clean_status = status.strip() if status and status.strip() else None

    service = TenantService(db)
    items, pagination = await service.list_companies(
        page=page,
        page_size=page_size,
        search=clean_search,
        business_type_id=bt_uuid,
        status=clean_status,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse(
        data=[CompanyResponse.model_validate(c) for c in items],
        pagination=pagination,
    )


@router.get("/{company_id}", response_model=StandardResponse[CompanyResponse])
async def get_company(
    company_id: uuid.UUID,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = TenantService(db)
    company = await service.get_company_by_id(company_id)
    return StandardResponse(
        message="Company retrieved successfully",
        data=CompanyResponse.model_validate(company),
    )


@router.put("/{company_id}", response_model=StandardResponse[CompanyResponse])
async def update_company(
    company_id: uuid.UUID,
    data: CompanyUpdate,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = TenantService(db)
    company = await service.update_company(company_id, data)
    return StandardResponse(
        message="Company updated successfully",
        data=CompanyResponse.model_validate(company),
    )


@router.patch("/{company_id}/status", response_model=StandardResponse[CompanyResponse])
async def update_company_status(
    company_id: uuid.UUID,
    data: CompanyStatusUpdate,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = TenantService(db)
    company = await service.update_company_status(company_id, data)
    return StandardResponse(
        message="Company status updated successfully",
        data=CompanyResponse.model_validate(company),
    )


@router.delete("/{company_id}", response_model=StandardResponse[None])
async def delete_company(
    company_id: uuid.UUID,
    current_user: User = Depends(require_roles(RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = TenantService(db)
    await service.soft_delete_company(company_id, user_id=current_user.id)
    return StandardResponse(
        message="Company archived and soft-deleted successfully",
        data=None,
    )
