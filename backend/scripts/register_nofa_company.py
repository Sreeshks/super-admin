import asyncio
import os
import sys
import uuid
from datetime import UTC, datetime

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select

from app.core.database import async_session_factory
from app.core.permissions import RoleEnum
from app.core.security import hash_password
from app.models.audit import AuditLog
from app.models.business_type import BusinessType
from app.models.content import (
    CompanyProfile,
    ContactDetails,
    Location,
    SocialLink,
    WebsiteSection,
)
from app.models.subscriptions import SubscriptionPlan, TenantSubscription
from app.models.tenant import Tenant
from app.models.user import Role, User

DEFAULT_SECTIONS = [
    ("hero", True, 1),
    ("about", True, 2),
    ("categories", True, 3),
    ("services", True, 4),
    ("offers", True, 5),
    ("instagram", True, 6),
    ("gallery", True, 7),
    ("testimonials", True, 8),
    ("faq", True, 9),
    ("blog", True, 10),
    ("contact", True, 11),
    ("footer", True, 12),
]


async def register_nofa_company():
    print("=" * 60)
    print("STEP 1: Checking for existing company records...")
    print("=" * 60)

    slug = "nofa-beauty-center"
    company_name = "Nofa Beauty Center"

    async with async_session_factory() as session:
        # Check if company with slug or name already exists
        stmt_existing = select(Tenant).where(
            (Tenant.slug == slug) | (Tenant.name.ilike(company_name))
        )
        existing = (await session.execute(stmt_existing)).scalars().first()

        if existing:
            print(f"[ALREADY EXISTS] Company '{existing.name}' with slug '{existing.slug}' already exists (ID: {existing.id}).")
            print("Aborting registration to prevent duplicate records as instructed.")
            return {
                "status": "already_exists",
                "tenant_id": str(existing.id),
                "name": existing.name,
                "slug": existing.slug,
                "website_status": existing.website_status,
                "account_status": existing.account_status,
            }

        print("No duplicate company found. Proceeding with registration.")

        # STEP 2: Resolve Business Type (Beauty Center / Salon)
        print("\n" + "=" * 60)
        print("STEP 2: Resolving Business Type...")
        print("=" * 60)

        # Look for beauty-center or beauty-salon or beauty-parlour
        stmt_bt = select(BusinessType).where(
            (BusinessType.slug == "beauty-center")
            | (BusinessType.slug == "beauty-salon")
            | (BusinessType.slug == "beauty-parlour")
        ).order_by(BusinessType.slug)
        bt_results = (await session.execute(stmt_bt)).scalars().all()

        target_bt = None
        for bt in bt_results:
            if bt.slug == "beauty-center":
                target_bt = bt
                break

        if not target_bt:
            # Check if beauty-parlour exists
            for bt in bt_results:
                if bt.slug == "beauty-parlour":
                    target_bt = bt
                    break

        if not target_bt:
            # Create Beauty Center if not present
            print("Creating new BusinessType: 'Beauty Center' (slug: beauty-center)...")
            target_bt = BusinessType(
                name="Beauty Center",
                slug="beauty-center",
                description="Beauty Center & Beauty Salon providing personal care and wellness services.",
                default_configuration={
                    "category": "Beauty & Personal Care",
                    "template": "editorial-luxury",
                    "theme": "luxury",
                    "primary_color": "#1A1A1A",
                },
                status="active",
            )
            session.add(target_bt)
            await session.flush()
            print(f"Created BusinessType ID: {target_bt.id}")
        else:
            print(f"Matched existing BusinessType: '{target_bt.name}' (slug: {target_bt.slug}, ID: {target_bt.id})")

        # STEP 3: Create Tenant
        print("\n" + "=" * 60)
        print("STEP 3: Creating Tenant record...")
        print("=" * 60)

        # website_status set to 'maintenance' as required for unverified/draft status
        tenant = Tenant(
            name=company_name,
            slug=slug,
            business_type_id=target_bt.id,
            website_status="maintenance",
            account_status="active",
        )
        session.add(tenant)
        await session.flush()
        tenant_id = tenant.id
        print(f"Tenant created successfully! ID: {tenant_id}")

        # STEP 4: Create Company Profile
        print("\n" + "=" * 60)
        print("STEP 4: Creating Company Profile...")
        print("=" * 60)

        profile = CompanyProfile(
            tenant_id=tenant_id,
            company_name=company_name,
            logo=None,
            favicon=None,
            short_description=None,  # Unverified - left null
            full_description=None,   # Unverified - left null
            about_section=None,
            phone="+968 9746 9712",
            email=None,              # Unconfirmed - left null
            whatsapp_number=None,    # Not verified - left null
            address="Way 257, Muscat 133, Oman",
            city="Muscat",
            state=None,
            country="Oman",
            postal_code="133",
            latitude=None,
            longitude=None,
            opening_hours=None,
            website_url=None,        # Not confirmed - left null
            contact_email=None,
        )
        session.add(profile)

        # STEP 5: Create Primary Location
        print("\n" + "=" * 60)
        print("STEP 5: Creating Primary Location...")
        print("=" * 60)

        location = Location(
            tenant_id=tenant_id,
            location_name="Nofa Beauty Center - Main Branch",
            address="Way 257, Muscat 133, Oman",
            city="Muscat",
            state=None,
            country="Oman",
            postal_code="133",
            contact_number="+968 9746 9712",
            email=None,
            is_primary=True,
            status="active",
        )
        session.add(location)

        # STEP 6: Create Instagram Social Link
        print("\n" + "=" * 60)
        print("STEP 6: Storing Instagram Social Link...")
        print("=" * 60)

        social_link = SocialLink(
            tenant_id=tenant_id,
            platform="instagram",
            url="https://www.instagram.com/nofa_beauty_center/",
            display_order=1,
            status="active",
        )
        session.add(social_link)

        # STEP 7: Create Contact Details
        print("\n" + "=" * 60)
        print("STEP 7: Creating Contact Details...")
        print("=" * 60)

        contact = ContactDetails(
            tenant_id=tenant_id,
            business_email=None,
            phone="+968 9746 9712",
            whatsapp=None,
            address="Way 257, Muscat 133, Oman",
        )
        session.add(contact)

        # STEP 8: Create Default Website Sections (configured for Editorial Luxury)
        print("\n" + "=" * 60)
        print("STEP 8: Initializing Website Sections...")
        print("=" * 60)

        for sec_key, enabled, order in DEFAULT_SECTIONS:
            sec_config = {}
            if sec_key == "hero":
                sec_config = {
                    "template": "editorial-luxury",
                    "business_category": "Beauty & Personal Care",
                    "heading": "Nofa Beauty Center",
                    "subtitle": "Muscat, Oman",
                }
            elif sec_key == "about":
                sec_config = {
                    "template": "editorial-luxury",
                    "status": "pending_verification",
                }
            section = WebsiteSection(
                tenant_id=tenant_id,
                section_key=sec_key,
                enabled=enabled,
                display_order=order,
                configuration=sec_config,
            )
            session.add(section)

        # STEP 9: Internal Provisioning Admin Account
        print("\n" + "=" * 60)
        print("STEP 9: Creating Internal Provisioning Admin User...")
        print("=" * 60)

        stmt_role = select(Role).where(Role.name == RoleEnum.COMPANY_ADMIN.value)
        ca_role = (await session.execute(stmt_role)).scalars().first()

        admin_email = "provisioning.nofa@internal.platform.local"
        provisioning_admin = User(
            tenant_id=tenant_id,
            email=admin_email,
            full_name="Internal Provisioning (Nofa Center)",
            phone=None,
            password_hash=hash_password("NofaCenter@Internal2026"),
            is_active=True,
        )
        if ca_role:
            provisioning_admin.roles.append(ca_role)
        session.add(provisioning_admin)
        print(f"Created internal provisioning account: {admin_email} (Role: COMPANY_ADMIN)")

        # STEP 10: Assign Default Subscription Plan
        print("\n" + "=" * 60)
        print("STEP 10: Assigning Default Subscription...")
        print("=" * 60)

        stmt_plan = select(SubscriptionPlan).where(SubscriptionPlan.is_active == True).limit(1)
        plan = (await session.execute(stmt_plan)).scalars().first()
        if plan:
            sub = TenantSubscription(
                tenant_id=tenant_id,
                plan_id=plan.id,
                status="active",
            )
            session.add(sub)
            print(f"Assigned subscription plan: {plan.name} (ID: {plan.id})")

        # STEP 11: Audit Log & Sources
        print("\n" + "=" * 60)
        print("STEP 11: Storing Audit Log with External Verification Sources...")
        print("=" * 60)

        audit = AuditLog(
            tenant_id=tenant_id,
            user_id=None,
            action="COMPANY_REGISTERED",
            entity_name="Tenant",
            entity_id=str(tenant_id),
            details={
                "company_name": company_name,
                "slug": slug,
                "verification_status": "unverified_directory_listing",
                "template": "editorial-luxury",
                "business_category": "Beauty & Personal Care",
                "sources": [
                    {
                        "source_type": "business_directory",
                        "url": "https://www.cybo.com/OM/lansab/beauty-salons?p=6",
                        "notes": "Cybo Oman Lansab Beauty Salons Directory"
                    },
                    {
                        "source_type": "business_directory",
                        "url": "https://www.top-rated.online/countries/Oman/cities/Muscat/@beauty_salon",
                        "notes": "Top-Rated Online Muscat Beauty Salons"
                    },
                    {
                        "source_type": "social_profile",
                        "url": "https://www.instagram.com/nofa_beauty_center/",
                        "notes": "Instagram profile provided by platform administrator"
                    }
                ],
                "compliance_notes": "All unverified fields (email, website, whatsapp, services, description) kept null/empty. Website status set to 'maintenance'.",
            },
        )
        session.add(audit)

        # Commit transaction
        await session.commit()
        print("\n" + "=" * 60)
        print("Registration completed and committed to database successfully!")
        print("=" * 60)

        return {
            "status": "success",
            "tenant_id": str(tenant_id),
            "company_name": company_name,
            "slug": slug,
            "business_type_id": str(target_bt.id),
            "business_type_name": target_bt.name,
            "business_type_slug": target_bt.slug,
            "website_status": tenant.website_status,
            "account_status": tenant.account_status,
            "admin_user_id": str(provisioning_admin.id),
            "admin_email": admin_email,
        }


if __name__ == "__main__":
    result = asyncio.run(register_nofa_company())
    print("\nResult summary:")
    for k, v in result.items():
        print(f"  {k}: {v}")

