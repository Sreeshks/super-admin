import uuid

from fastapi import Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.core.permissions import RoleEnum
from app.dependencies.auth import get_current_user
from app.models.tenant import Tenant
from app.models.user import User
from app.repositories.tenant import TenantRepository


async def get_current_tenant_id(
    current_user: User = Depends(get_current_user),
    x_tenant_id: str | None = Header(None, alias="X-Tenant-ID"),
) -> uuid.UUID:
    """
    Resolve tenant_id securely.
    - Regular company admins / content managers ALWAYS use their associated user.tenant_id.
    - Super Admins can pass X-Tenant-ID to impersonate or administer a specific tenant.
    - Any attempt by non-superadmins to provide or spoof another tenant ID is rejected.
    """
    user_role_names = {r.name for r in current_user.roles}
    is_superadmin = RoleEnum.SUPER_ADMIN.value in user_role_names

    if not is_superadmin:
        if not current_user.tenant_id:
            raise ForbiddenException("User is not associated with any tenant")
        return current_user.tenant_id

    # If Super Admin
    if x_tenant_id:
        try:
            return uuid.UUID(x_tenant_id)
        except ValueError:
            raise BadRequestException("Invalid X-Tenant-ID format")
    elif current_user.tenant_id:
        return current_user.tenant_id
    else:
        raise BadRequestException("X-Tenant-ID header is required for Super Admin acting on tenant resources")


async def resolve_public_tenant(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    """
    Resolve tenant for public website endpoints.
    Can be resolved by:
    1. Direct URL slug from path params (e.g. /public/websites/{slug})
    2. Verified custom domain matching the Host header
    """
    tenant_repo = TenantRepository(db)
    tenant: Tenant | None = None

    slug = request.path_params.get("slug")
    if slug:
        tenant = await tenant_repo.get_by_slug(slug)
    else:
        # Check custom domain from Host header
        host = request.headers.get("host", "").split(":")[0].strip()
        if host and host not in ("localhost", "127.0.0.1"):
            tenant = await tenant_repo.get_by_verified_domain(host)

    if not tenant:
        raise NotFoundException("Company website not found")

    if tenant.website_status != "active" or tenant.account_status != "active":
        raise NotFoundException("Company website is currently unavailable")

    return tenant
