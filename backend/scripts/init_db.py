import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, engine
import app.models  # Import all models so they register with Base.metadata
from scripts.create_superadmin import create_superadmin
from scripts.seed_data import seed_data


async def init_and_seed():
    print("Creating all database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")

    print("Creating Super Admin and default roles...")
    await create_superadmin()

    print("Seeding business types and subscription plans...")
    await seed_data()

    print("Database initialization and bootstrap complete!")


if __name__ == "__main__":
    asyncio.run(init_and_seed())

