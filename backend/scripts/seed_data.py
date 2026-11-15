import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select

from app.core.database import async_session_factory
from app.models.business_type import BusinessType
from app.models.subscriptions import SubscriptionPlan
from app.utils.slug import generate_slug

BUSINESS_TYPES = [
    {
        "name": "Salon",
        "description": "Hair cuts, styling, grooming and modern beauty salon treatments.",
        "default_configuration": {"theme": "luxury", "primary_color": "#D4AF37"},
    },
    {
        "name": "Spa",
        "description": "Relaxation massages, body therapies, aromatherapy and hydrotherapy.",
        "default_configuration": {"theme": "calm", "primary_color": "#2A9D8F"},
    },
    {
        "name": "Beauty Parlour",
        "description": "Facials, waxing, threading, bridal makeup and cosmetic services.",
        "default_configuration": {"theme": "elegant", "primary_color": "#E76F51"},
    },
    {
        "name": "Wellness Centre",
        "description": "Holistic wellbeing, detox treatments, yoga and health therapies.",
        "default_configuration": {"theme": "nature", "primary_color": "#457B9D"},
    },
    {
        "name": "Hair Studio",
        "description": "Specialized hair artistry, colouring, extensions and treatments.",
        "default_configuration": {"theme": "modern", "primary_color": "#1D3557"},
    },
]

PLANS = [
    {
        "name": "FREE",
        "description": "Trial plan for new businesses.",
        "price": 0.0,
        "billing_cycle": "monthly",
        "max_services": 15,
        "max_locations": 1,
        "max_storage_mb": 250,
        "max_admins": 1,
        "allow_custom_domain": False,
    },
    {
        "name": "BASIC",
        "description": "Ideal for single-location boutique salons.",
        "price": 29.0,
        "billing_cycle": "monthly",
        "max_services": 50,
        "max_locations": 1,
        "max_storage_mb": 1000,
        "max_admins": 2,
        "allow_custom_domain": False,
    },
    {
        "name": "PREMIUM",
        "description": "For growing salons and spas with custom domain support.",
        "price": 79.0,
        "billing_cycle": "monthly",
        "max_services": 200,
        "max_locations": 3,
        "max_storage_mb": 5000,
        "max_admins": 5,
        "allow_custom_domain": True,
    },
    {
        "name": "ENTERPRISE",
        "description": "Unlimited capacity for chains and wellness groups.",
        "price": 199.0,
        "billing_cycle": "monthly",
        "max_services": 1000,
        "max_locations": 10,
        "max_storage_mb": 25000,
        "max_admins": 20,
        "allow_custom_domain": True,
    },
]


async def seed_data():
    async with async_session_factory() as session:
        # Seed Business Types
        for bt in BUSINESS_TYPES:
            slug = generate_slug(bt["name"])
            stmt = select(BusinessType).where(BusinessType.slug == slug)
            existing = (await session.execute(stmt)).scalars().first()
            if not existing:
                record = BusinessType(
                    name=bt["name"],
                    slug=slug,
                    description=bt["description"],
                    default_configuration=bt["default_configuration"],
                    status="active",
                )
                session.add(record)
                print(f"Created Business Type: {bt['name']}")

        # Seed Subscription Plans
        for plan in PLANS:
            slug = generate_slug(plan["name"])
            stmt = select(SubscriptionPlan).where(SubscriptionPlan.slug == slug)
            existing = (await session.execute(stmt)).scalars().first()
            if not existing:
                p_dict = dict(plan)
                p_dict["slug"] = slug
                record = SubscriptionPlan(**p_dict)
                session.add(record)
                print(f"Created Subscription Plan: {plan['name']}")

        await session.commit()
        print("Data seeding completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed_data())
