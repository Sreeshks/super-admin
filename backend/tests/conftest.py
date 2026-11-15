import os

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Set testing environment variables before importing app
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-for-unit-testing-32-chars-long"

from app.core.database import Base, get_db
from app.core.permissions import RoleEnum
from app.core.security import create_access_token, hash_password
from app.dependencies.rate_limit import _request_records
from app.main import app
from app.models.business_type import BusinessType
from app.models.content import CompanyProfile, ContactDetails, WebsiteSection
from app.models.tenant import Tenant
from app.models.user import Role, User

test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
test_session_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(autouse=True)
async def clean_db():
    _request_records.clear()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    _request_records.clear()


@pytest_asyncio.fixture
async def db_session():
    async with test_session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def setup_roles(db_session: AsyncSession):
    roles = {}
    for r in RoleEnum:
        stmt = select(Role).where(Role.name == r.value)
        role = (await db_session.execute(stmt)).scalars().first()
        if not role:
            role = Role(name=r.value, description=f"Role {r.value}")
            db_session.add(role)
        roles[r.value] = role
    await db_session.flush()
    return roles


@pytest_asyncio.fixture
async def default_business_type(db_session: AsyncSession):
    stmt = select(BusinessType).where(BusinessType.slug == "salon")
    bt = (await db_session.execute(stmt)).scalars().first()
    if not bt:
        bt = BusinessType(
            name="Salon",
            slug="salon",
            description="Hair & beauty salon",
            status="active",
        )
        db_session.add(bt)
        await db_session.flush()
    return bt


@pytest_asyncio.fixture
async def superadmin_user(db_session: AsyncSession, setup_roles):
    stmt = select(User).where(User.email == "superadmin@platform.com")
    sa = (await db_session.execute(stmt)).scalars().first()
    if not sa:
        sa = User(
            email="superadmin@platform.com",
            full_name="Platform SuperAdmin",
            password_hash=hash_password("SuperAdmin@123456"),
            is_active=True,
        )
        sa.roles.append(setup_roles[RoleEnum.SUPER_ADMIN.value])
        db_session.add(sa)
        await db_session.flush()
    return sa


@pytest_asyncio.fixture
async def superadmin_headers(superadmin_user: User):
    token = create_access_token(
        subject=str(superadmin_user.id),
        claims={"email": superadmin_user.email, "roles": [RoleEnum.SUPER_ADMIN.value], "tenant_id": None},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def tenant_a(db_session: AsyncSession, default_business_type, setup_roles):
    stmt = select(Tenant).where(Tenant.slug == "company-a")
    tenant = (await db_session.execute(stmt)).scalars().first()
    if not tenant:
        tenant = Tenant(
            name="Company A Saloon",
            slug="company-a",
            business_type_id=default_business_type.id,
            website_status="active",
            account_status="active",
        )
        db_session.add(tenant)
        await db_session.flush()

        profile = CompanyProfile(
            tenant_id=tenant.id,
            company_name=tenant.name,
            email="admin@companya.com",
            address="100 Luxury St",
            city="Mumbai",
        )
        db_session.add(profile)

        contact = ContactDetails(
            tenant_id=tenant.id,
            business_email="contact@companya.com",
        )
        db_session.add(contact)

        # Sections
        sections = [
            WebsiteSection(tenant_id=tenant.id, section_key="hero", enabled=True, display_order=1),
            WebsiteSection(tenant_id=tenant.id, section_key="categories", enabled=True, display_order=2),
            WebsiteSection(tenant_id=tenant.id, section_key="services", enabled=True, display_order=3),
            WebsiteSection(tenant_id=tenant.id, section_key="offers", enabled=True, display_order=4),
            WebsiteSection(tenant_id=tenant.id, section_key="faq", enabled=False, display_order=5),
        ]
        db_session.add_all(sections)

        user = User(
            tenant_id=tenant.id,
            email="admin@companya.com",
            full_name="Admin Company A",
            password_hash=hash_password("PasswordA@123"),
            is_active=True,
        )
        user.roles.append(setup_roles[RoleEnum.COMPANY_ADMIN.value])
        db_session.add(user)
        await db_session.flush()
    else:
        stmt_u = select(User).where(User.email == "admin@companya.com")
        user = (await db_session.execute(stmt_u)).scalars().first()

    return {"tenant": tenant, "user": user}


@pytest_asyncio.fixture
async def tenant_a_headers(tenant_a):
    user = tenant_a["user"]
    tenant = tenant_a["tenant"]
    token = create_access_token(
        subject=str(user.id),
        claims={"email": user.email, "roles": [RoleEnum.COMPANY_ADMIN.value], "tenant_id": str(tenant.id)},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def tenant_b(db_session: AsyncSession, default_business_type, setup_roles):
    stmt = select(Tenant).where(Tenant.slug == "company-b")
    tenant = (await db_session.execute(stmt)).scalars().first()
    if not tenant:
        tenant = Tenant(
            name="Company B Spa",
            slug="company-b",
            business_type_id=default_business_type.id,
            website_status="active",
            account_status="active",
        )
        db_session.add(tenant)
        await db_session.flush()

        profile = CompanyProfile(
            tenant_id=tenant.id,
            company_name=tenant.name,
            email="admin@companyb.com",
            address="200 Wellness Ave",
            city="Bangalore",
        )
        db_session.add(profile)

        contact = ContactDetails(
            tenant_id=tenant.id,
            business_email="contact@companyb.com",
        )
        db_session.add(contact)

        user = User(
            tenant_id=tenant.id,
            email="admin@companyb.com",
            full_name="Admin Company B",
            password_hash=hash_password("PasswordB@123"),
            is_active=True,
        )
        user.roles.append(setup_roles[RoleEnum.COMPANY_ADMIN.value])
        db_session.add(user)
        await db_session.flush()
    else:
        stmt_u = select(User).where(User.email == "admin@companyb.com")
        user = (await db_session.execute(stmt_u)).scalars().first()

    return {"tenant": tenant, "user": user}


@pytest_asyncio.fixture
async def tenant_b_headers(tenant_b):
    user = tenant_b["user"]
    tenant = tenant_b["tenant"]
    token = create_access_token(
        subject=str(user.id),
        claims={"email": user.email, "roles": [RoleEnum.COMPANY_ADMIN.value], "tenant_id": str(tenant.id)},
    )
    return {"Authorization": f"Bearer {token}"}
