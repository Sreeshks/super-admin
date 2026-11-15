import asyncio
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select

from app.core.config import settings
from app.core.database import async_session_factory
from app.core.permissions import RoleEnum
from app.core.security import hash_password
from app.models.user import Role, User


async def create_superadmin():
    async with async_session_factory() as session:
        # 1. Create Default Roles
        for role_name in RoleEnum:
            stmt = select(Role).where(Role.name == role_name.value)
            role = (await session.execute(stmt)).scalars().first()
            if not role:
                role = Role(name=role_name.value, description=f"Default role for {role_name.value}")
                session.add(role)
        await session.flush()

        # 2. Check if Super Admin exists
        stmt_user = select(User).where(User.email == settings.FIRST_SUPERADMIN_EMAIL.lower())
        superadmin = (await session.execute(stmt_user)).scalars().first()

        if not superadmin:
            stmt_sa_role = select(Role).where(Role.name == RoleEnum.SUPER_ADMIN.value)
            sa_role = (await session.execute(stmt_sa_role)).scalars().first()

            superadmin = User(
                email=settings.FIRST_SUPERADMIN_EMAIL.lower(),
                full_name=settings.FIRST_SUPERADMIN_NAME,
                password_hash=hash_password(settings.FIRST_SUPERADMIN_PASSWORD),
                is_active=True,
            )
            superadmin.roles.append(sa_role)
            session.add(superadmin)
            await session.commit()
            print(f"Super Admin created: {settings.FIRST_SUPERADMIN_EMAIL}")
        else:
            print(f"Super Admin already exists: {settings.FIRST_SUPERADMIN_EMAIL}")


if __name__ == "__main__":
    asyncio.run(create_superadmin())
