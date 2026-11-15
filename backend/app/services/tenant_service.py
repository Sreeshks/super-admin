import uuid
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    ConflictException,
    NotFoundException,
)
from app.core.permissions import RoleEnum
from app.core.security import hash_password
from app.models.audit import AuditLog
from app.models.business_type import BusinessType
from app.models.content import (
    CompanyProfile,
    ContactDetails,
    Location,
    WebsiteSection,
)
from app.models.subscriptions import SubscriptionPlan, TenantSubscription
from app.models.tenant import Tenant
from app.models.user import Role, User
from app.repositories.tenant import TenantRepository
from app.schemas.common import PaginationMeta
from app.schemas.tenant import (
    CompanyCreate,
    CompanyCreateResponse,
    CompanyResponse,
    CompanyStatusUpdate,
    CompanyUpdate,
)
from app.utils.slug import generate_slug

DEFAULT_SECTIONS = [
    ("hero", True, 1),
    ("about", True, 2),
    ("categories", True, 3),
    ("services", True, 4),
    ("offers", True, 5),
    ("instagram", True, 6),
    ("youtube", True, 7),
    ("testimonials", True, 8),
    ("faq", True, 9),
    ("blog", True, 10),
    ("contact", True, 11),
    ("footer", True, 12),
]


class TenantService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.tenant_repo = TenantRepository(db)

    async def create_company(
        self, data: CompanyCreate, creator_id: uuid.UUID | None = None
    ) -> CompanyCreateResponse:
        """Atomic creation of Tenant, Profile, Admin User, Sections, and Audit log."""
        # Validate business type exists
        stmt_bt = select(BusinessType).where(BusinessType.id == data.business_type_id, BusinessType.is_deleted == False)
        result_bt = await self.db.execute(stmt_bt)
        business_type = result_bt.scalars().first()
        if not business_type:
            raise NotFoundException("Selected business type does not exist or is inactive")

        # Determine & validate unique slug
        slug = data.slug.strip() if data.slug else generate_slug(data.company_name)
        existing_tenant = await self.tenant_repo.get_by_slug(slug, include_deleted=True)
        if existing_tenant:
            raise ConflictException(f"Company slug '{slug}' is already taken")

        # Validate unique admin email
        stmt_user = select(User).where(User.email == data.admin_email.lower())
        result_user = await self.db.execute(stmt_user)
        if result_user.scalars().first():
            raise ConflictException(f"Email '{data.admin_email}' is already registered in the platform")

        # Get or create COMPANY_ADMIN role
        stmt_role = select(Role).where(Role.name == RoleEnum.COMPANY_ADMIN.value)
        result_role = await self.db.execute(stmt_role)
        company_admin_role = result_role.scalars().first()
        if not company_admin_role:
            company_admin_role = Role(
                name=RoleEnum.COMPANY_ADMIN.value,
                description="Administrator for a single company tenant",
            )
            self.db.add(company_admin_role)
            await self.db.flush()

        # 1. Create Tenant
        tenant = Tenant(
            name=data.company_name,
            slug=slug,
            business_type_id=data.business_type_id,
            website_status=data.website_status,
            account_status=data.account_status,
        )
        self.db.add(tenant)
        await self.db.flush()

        # 2. Create Company Profile
        profile = CompanyProfile(
            tenant_id=tenant.id,
            company_name=data.company_name,
            logo=data.logo,
            favicon=data.favicon,
            phone=data.phone,
            email=str(data.email) if data.email else str(data.admin_email),
            short_description=data.description,
            address=data.address,
            city=data.city,
            state=data.state,
            country=data.country or "India",
            postal_code=data.postal_code,
            latitude=data.latitude,
            longitude=data.longitude,
        )
        self.db.add(profile)

        # 3. Create Default Primary Location
        if data.address and data.city:
            primary_location = Location(
                tenant_id=tenant.id,
                location_name=f"{data.company_name} - Main Branch",
                address=data.address,
                city=data.city,
                state=data.state,
                country=data.country or "India",
                postal_code=data.postal_code,
                latitude=data.latitude,
                longitude=data.longitude,
                contact_number=data.phone,
                email=str(data.email) if data.email else str(data.admin_email),
                is_primary=True,
                status="active",
            )
            self.db.add(primary_location)

        # 4. Create Company Administrator
        admin_user = User(
            tenant_id=tenant.id,
            email=data.admin_email.lower(),
            full_name=data.admin_name,
            phone=data.phone,
            password_hash=hash_password(data.initial_password),
            is_active=True,
        )
        admin_user.roles.append(company_admin_role)
        self.db.add(admin_user)
        await self.db.flush()

        # 5. Create Default Website Sections
        for section_key, enabled, order in DEFAULT_SECTIONS:
            sec = WebsiteSection(
                tenant_id=tenant.id,
                section_key=section_key,
                enabled=enabled,
                display_order=order,
                configuration={},
            )
            self.db.add(sec)

        # 6. Create Contact Details
        contact = ContactDetails(
            tenant_id=tenant.id,
            business_email=str(data.email) if data.email else str(data.admin_email),
            phone=data.phone,
            address=data.address,
            latitude=data.latitude,
            longitude=data.longitude,
        )
        self.db.add(contact)

        # 7. Create Free default subscription if plans exist
        stmt_plan = select(SubscriptionPlan).where(SubscriptionPlan.is_active == True).limit(1)
        res_plan = await self.db.execute(stmt_plan)
        default_plan = res_plan.scalars().first()
        if default_plan:
            sub = TenantSubscription(
                tenant_id=tenant.id,
                plan_id=default_plan.id,
                status="active",
            )
            self.db.add(sub)

        # 8. Audit Log
        audit = AuditLog(
            tenant_id=tenant.id,
            user_id=creator_id,
            action="COMPANY_CREATED",
            entity_name="Tenant",
            entity_id=str(tenant.id),
            details={"company_name": tenant.name, "slug": tenant.slug, "admin_email": admin_user.email},
        )
        self.db.add(audit)

        # Commit transaction atomically
        await self.db.commit()
        await self.db.refresh(tenant)

        return CompanyCreateResponse(
            company=CompanyResponse.model_validate(tenant),
            admin_user_id=admin_user.id,
            admin_email=admin_user.email,
            admin_name=admin_user.full_name,
        )

    async def list_companies(
        self,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        business_type_id: uuid.UUID | None = None,
        status: str | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[list[Tenant], PaginationMeta]:
        filters: list[Any] = [Tenant.is_deleted == False]

        if business_type_id:
            filters.append(Tenant.business_type_id == business_type_id)

        if status:
            filters.append(Tenant.account_status == status)

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(or_(Tenant.name.ilike(search_term), Tenant.slug.ilike(search_term)))

        order_col = getattr(Tenant, sort_by, Tenant.created_at)
        order_clause = order_col.desc() if sort_order.lower() == "desc" else order_col.asc()

        items, pagination = await self.tenant_repo.list_paginated(
            page=page,
            page_size=page_size,
            filters=filters,
            order_by=order_clause,
        )
        return list(items), pagination

    async def get_company_by_id(self, company_id: uuid.UUID) -> Tenant:
        tenant = await self.tenant_repo.get_by_id(company_id)
        if not tenant:
            raise NotFoundException("Company not found")
        return tenant

    async def update_company(self, company_id: uuid.UUID, data: CompanyUpdate) -> Tenant:
        tenant = await self.get_company_by_id(company_id)

        if data.name:
            tenant.name = data.name
        if data.slug:
            clean_slug = generate_slug(data.slug)
            if clean_slug != tenant.slug:
                existing = await self.tenant_repo.get_by_slug(clean_slug)
                if existing and existing.id != tenant.id:
                    raise ConflictException(f"Slug '{clean_slug}' is already taken")
                tenant.slug = clean_slug
        if data.business_type_id:
            tenant.business_type_id = data.business_type_id
        if data.website_status:
            tenant.website_status = data.website_status
        if data.account_status:
            tenant.account_status = data.account_status

        await self.db.commit()
        await self.db.refresh(tenant)
        return tenant

    async def update_company_status(self, company_id: uuid.UUID, data: CompanyStatusUpdate) -> Tenant:
        tenant = await self.get_company_by_id(company_id)
        if data.website_status:
            tenant.website_status = data.website_status
        if data.account_status:
            tenant.account_status = data.account_status
        await self.db.commit()
        await self.db.refresh(tenant)
        return tenant

    async def soft_delete_company(self, company_id: uuid.UUID, user_id: uuid.UUID | None = None) -> None:
        """Soft delete company (Never permanent deletion through normal API)."""
        tenant = await self.get_company_by_id(company_id)
        tenant.soft_delete()
        tenant.account_status = "suspended"
        tenant.website_status = "disabled"

        audit = AuditLog(
            tenant_id=tenant.id,
            user_id=user_id,
            action="COMPANY_SOFT_DELETED",
            entity_name="Tenant",
            entity_id=str(tenant.id),
            details={"company_name": tenant.name},
        )
        self.db.add(audit)
        await self.db.commit()
