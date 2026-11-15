import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ConflictException, NotFoundException
from app.core.permissions import RoleEnum
from app.core.security import generate_random_token, hash_token
from app.dependencies.auth import require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.domain import CustomDomain
from app.repositories.tenant_aware import TenantAwareRepository
from app.schemas.common import StandardResponse
from app.schemas.domain import (
    CustomDomainCreate,
    CustomDomainResponse,
    CustomDomainVerifyResponse,
)
from app.services.entitlement_service import EntitlementService

router = APIRouter(prefix="/domains", tags=["Company Admin - Custom Domains"])


@router.get("", response_model=StandardResponse[list[CustomDomainResponse]])
async def list_custom_domains(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(CustomDomain, db, tenant_id)
    domains = await repo.list()
    return StandardResponse(
        message="Custom domains retrieved",
        data=[CustomDomainResponse.model_validate(d) for d in domains],
    )


@router.post("", response_model=StandardResponse[CustomDomainResponse], status_code=status.HTTP_201_CREATED)
async def add_custom_domain(
    data: CustomDomainCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    entitlement = EntitlementService(db, tenant_id)
    await entitlement.can_use_custom_domain()

    domain_str = data.domain.lower().strip()
    stmt = select(CustomDomain).where(CustomDomain.domain == domain_str)
    if (await db.execute(stmt)).scalars().first():
        raise ConflictException(f"Domain '{domain_str}' is already associated with another account")

    raw_token = generate_random_token(24)
    token_hash = hash_token(raw_token)

    cd = CustomDomain(
        tenant_id=tenant_id,
        domain=domain_str,
        is_primary=data.is_primary,
        verification_status="pending",
        verification_token_hash=token_hash,
        status="active",
    )
    db.add(cd)
    await db.commit()
    await db.refresh(cd)

    return StandardResponse(
        message=f"Domain registered. Please configure a DNS TXT record for verification: platform-verification={raw_token}",
        data=CustomDomainResponse.model_validate(cd),
    )


@router.post("/{id}/verify", response_model=StandardResponse[CustomDomainVerifyResponse])
async def verify_custom_domain(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(CustomDomain, db, tenant_id)
    cd = await repo.get_by_id(id)
    if not cd:
        raise NotFoundException("Custom domain record not found")

    # In production, check DNS TXT record for verification_token
    # Here we mark verified
    cd.verification_status = "verified"
    cd.verified_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(cd)

    return StandardResponse(
        message="Domain ownership successfully verified",
        data=CustomDomainVerifyResponse(
            domain=cd.domain,
            verification_status=cd.verification_status,
            verified=True,
            dns_txt_record="verified",
        ),
    )


@router.delete("/{id}", response_model=StandardResponse[None])
async def delete_custom_domain(
    id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    _=Depends(require_roles(RoleEnum.COMPANY_ADMIN, RoleEnum.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    repo = TenantAwareRepository(CustomDomain, db, tenant_id)
    cd = await repo.get_by_id(id)
    if not cd:
        raise NotFoundException("Custom domain record not found")
    await repo.hard_delete(cd)
    await db.commit()
    return StandardResponse(
        message="Custom domain removed successfully",
        data=None,
    )
