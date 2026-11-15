import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select, delete
from app.core.database import async_session_factory
from app.models.tenant import Tenant
from app.models.content import (
    Banner,
    Category,
    CompanyProfile,
    MediaAsset,
    Offer,
    Service,
    Testimonial,
)

async def enrich_nofa():
    async with async_session_factory() as session:
        t = (await session.execute(select(Tenant).where(Tenant.slug == "nofa-beauty-center"))).scalars().first()
        if not t:
            print("Nofa Beauty Center not found!")
            return

        print(f"Enriching Nofa Beauty Center ({t.id})...")

        # 1. Update Profile with Logo & Descriptions
        if t.profile:
            t.profile.logo = "https://i.ibb.co/rGFt40gZ/nofa-luxury-hero.jpg"
            t.profile.favicon = "https://i.ibb.co/WvYWvJ1g/interior.webp"
            t.profile.about_section = "Nofa Beauty Center is Muscat's premier beauty and wellness sanctuary. We combine cutting-edge aesthetic rituals with calming holistic self-care, delivering personalized treatments designed around your skin, hair, and spirit."
            t.profile.short_description = "Where personalized aesthetic care meets calming holistic wellness. Muscat, Oman."
            session.add(t.profile)

        # 2. Add Multi-Hero Banners (3 Sliders)
        await session.execute(delete(Banner).where(Banner.tenant_id == t.id))
        await session.flush()

        banners = [
            Banner(
                tenant_id=t.id,
                media_type="IMAGE",
                desktop_media_url="https://i.ibb.co/rGFt40gZ/nofa-luxury-hero.jpg",
                mobile_media_url="https://i.ibb.co/5xtk4Jmm/nofa-mobile-portrait.webp",
                heading="Your glow begins here. Welcome to Nofa Beauty Center.",
                subtitle="BEAUTY SALON & WELLNESS SANCTUARY",
                description="Inspired by nature, light, and the soft rhythm of self-care. Book a personalized consultation to select treatments precisely crafted for you.",
                cta_button_text="Book an Appointment",
                cta_button_url="/nofa-beauty-center/contact",
                display_order=1,
                status="active",
            ),
            Banner(
                tenant_id=t.id,
                media_type="IMAGE",
                desktop_media_url="https://i.ibb.co/XrGGFNmC/relaxation-area.webp",
                mobile_media_url="https://i.ibb.co/23xNWwW0/spa-zone.webp",
                heading="Experience Ultimate Relaxation in Muscat.",
                subtitle="HYDROTHERAPY & BODY SANCTUARY",
                description="Indulge in botanical salt exfoliations, restorative aroma massages, and private thermal suites.",
                cta_button_text="Explore Spa Packages",
                cta_button_url="/nofa-beauty-center/services",
                display_order=2,
                status="active",
            ),
            Banner(
                tenant_id=t.id,
                media_type="IMAGE",
                desktop_media_url="https://i.ibb.co/WvYWvJ1g/interior.webp",
                mobile_media_url="https://i.ibb.co/5xtk4Jmm/nofa-mobile-portrait.webp",
                heading="Artistry & High-Performance Hair Styling.",
                subtitle="HAIR TREATMENTS & ATELIER",
                description="Organic scalp detox rituals, precision styling, and luminous dimensional hair care.",
                cta_button_text="View Hair Services",
                cta_button_url="/nofa-beauty-center/services",
                display_order=3,
                status="active",
            ),
        ]
        session.add_all(banners)

        # 3. Add Categories with Images
        await session.execute(delete(Category).where(Category.tenant_id == t.id))
        await session.flush()

        cat_skin = Category(
            tenant_id=t.id,
            name="Skin Care",
            slug="skin-care",
            description="Inspired by nature, light, and the soft rhythm of self-care, our skin treatments restore balance, nourish deeply, and reveal natural radiance.",
            image="https://i.ibb.co/cVbSPkP/skin-care.webp",
            display_order=1,
            status="active",
        )
        cat_hair = Category(
            tenant_id=t.id,
            name="Hair Treatments",
            slug="hair-treatments",
            description="Precision cutting, organic scalp detox rituals, and dimensional colour designed for brilliant shine and healthy bounce.",
            image="https://i.ibb.co/5xtk4Jmm/nofa-mobile-portrait.webp",
            display_order=2,
            status="active",
        )
        cat_spa = Category(
            tenant_id=t.id,
            name="Body Rituals & Spa",
            slug="body-rituals",
            description="Full-body tension relief, botanical salt scrubs, and hot herbal compresses crafted to restore posture and vitality.",
            image="https://i.ibb.co/23xNWwW0/spa-zone.webp",
            display_order=3,
            status="active",
        )
        cat_lounge = Category(
            tenant_id=t.id,
            name="Lounge & Wellness",
            slug="wellness-lounge",
            description="Thermal stone baths, meditative hydrotherapy, and bespoke bridal lounge suites.",
            image="https://i.ibb.co/XrGGFNmC/relaxation-area.webp",
            display_order=4,
            status="active",
        )
        session.add_all([cat_skin, cat_hair, cat_spa, cat_lounge])
        await session.flush()

        # 4. Add Services with Images
        await session.execute(delete(Service).where(Service.tenant_id == t.id))
        await session.flush()

        services = [
            Service(
                tenant_id=t.id,
                category_id=cat_skin.id,
                name="The Really Good Facial",
                slug="the-really-good-facial",
                short_description="The 60-minute personalized facial that transforms your skin and renews your confidence.",
                full_description="The 60-minute signature facial designed for deep hydration, gentle enzyme exfoliation, ultrasonic nutrient infusion, and a calming hydro-jelly botanical mask.",
                regular_price=55.0,
                discounted_price=55.0,
                currency="OMR",
                duration_minutes=60,
                featured_image="https://i.ibb.co/cVbSPkP/skin-care.webp",
                is_featured=True,
                display_order=1,
                status="active",
            ),
            Service(
                tenant_id=t.id,
                category_id=cat_skin.id,
                name="Dermaplaning & Glow",
                slug="dermaplaning-glow",
                short_description="Removes dead skin and peach fuzz for a soft, ultra-radiant finish.",
                full_description="Manual medical-grade epidermal exfoliation removing dull cells and vellus hair, allowing active serums to absorb with maximum efficacy.",
                regular_price=45.0,
                discounted_price=45.0,
                currency="OMR",
                duration_minutes=45,
                featured_image="https://i.ibb.co/rGFt40gZ/nofa-luxury-hero.jpg",
                is_featured=True,
                display_order=2,
                status="active",
            ),
            Service(
                tenant_id=t.id,
                category_id=cat_skin.id,
                name="Deep Hydration Facial",
                slug="deep-hydration-facial",
                short_description="Restores moisture using rich hyaluronic serums and calming massage techniques.",
                full_description="Targeted moisture infusion for dehydrated skin, featuring multi-molecular hyaluronic acid and cooling stone lymphatic drainage.",
                regular_price=65.0,
                discounted_price=50.0,
                currency="OMR",
                duration_minutes=60,
                featured_image="https://i.ibb.co/cVbSPkP/skin-care.webp",
                is_featured=True,
                display_order=3,
                status="active",
            ),
            Service(
                tenant_id=t.id,
                category_id=cat_hair.id,
                name="Silk Scalp Detox & Styling",
                slug="silk-scalp-detox",
                short_description="Clarifying organic scalp exfoliation followed by deep hydration mask and blowout.",
                full_description="Revitalize sluggish hair follicles with organic tea tree and rosemary scalp buffing, nourishing botanical masks, and a salon blowout.",
                regular_price=40.0,
                discounted_price=40.0,
                currency="OMR",
                duration_minutes=60,
                featured_image="https://i.ibb.co/5xtk4Jmm/nofa-mobile-portrait.webp",
                is_featured=True,
                display_order=4,
                status="active",
            ),
            Service(
                tenant_id=t.id,
                category_id=cat_spa.id,
                name="Aromatherapy Body Sanctuary",
                slug="aromatherapy-body-sanctuary",
                short_description="Relaxation body massage infused with pure Frankincense and floral oils.",
                full_description="A signature Omani Frankincense relaxation massage designed to relieve tense muscles and awaken sensory peace.",
                regular_price=60.0,
                discounted_price=60.0,
                currency="OMR",
                duration_minutes=75,
                featured_image="https://i.ibb.co/23xNWwW0/spa-zone.webp",
                is_featured=True,
                display_order=5,
                status="active",
            ),
            Service(
                tenant_id=t.id,
                category_id=cat_lounge.id,
                name="Thermal Hydrotherapy Soak",
                slug="thermal-hydrotherapy-soak",
                short_description="Private mineral bath soak with eucalyptus steam and herbal refreshments.",
                full_description="Relax your body in our warm thermal magnesium tub with private suite access, fresh herbal infusions, and eucalyptus steam.",
                regular_price=35.0,
                discounted_price=35.0,
                currency="OMR",
                duration_minutes=45,
                featured_image="https://i.ibb.co/XrGGFNmC/relaxation-area.webp",
                is_featured=True,
                display_order=6,
                status="active",
            ),
        ]
        session.add_all(services)

        # 5. Add Promotional Offers with Imagery
        await session.execute(delete(Offer).where(Offer.tenant_id == t.id))
        await session.flush()

        offers = [
            Offer(
                tenant_id=t.id,
                title="Welcome Glow Experience - 20% Off",
                slug="welcome-glow-experience",
                short_description="Enjoy 20% off your first facial and scalp treatment combination.",
                full_content="Experience the best of Nofa Beauty Center with our signature welcoming facial paired with scalp relaxation.",
                banner_image="https://i.ibb.co/cVbSPkP/skin-care.webp",
                regular_price=95.0,
                offer_price=76.0,
                discount_percentage=20.0,
                cta_text="Book Welcome Offer",
                cta_url="/nofa-beauty-center/contact",
                is_featured=True,
                display_order=1,
                status="active",
            ),
            Offer(
                tenant_id=t.id,
                title="Full Day Spa Sanctuary Package",
                slug="spa-sanctuary-package",
                short_description="Complete day of pampering: thermal soak, body polish, and signature facial.",
                full_content="Indulge in 3 hours of uninterrupted wellness with private suite access.",
                banner_image="https://i.ibb.co/23xNWwW0/spa-zone.webp",
                regular_price=150.0,
                offer_price=120.0,
                discount_percentage=20.0,
                cta_text="Reserve Spa Day",
                cta_url="/nofa-beauty-center/contact",
                is_featured=True,
                display_order=2,
                status="active",
            ),
        ]
        session.add_all(offers)

        # 6. Add Testimonials
        await session.execute(delete(Testimonial).where(Testimonial.tenant_id == t.id))
        await session.flush()

        testimonials = [
            Testimonial(
                tenant_id=t.id,
                customer_name="Fatima Al-Lawati",
                customer_designation="Muscat, Oman",
                customer_image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
                review="Nofa Beauty Center is by far the most calming and luxurious salon in Lansab. The facial left my skin glowing for days!",
                rating=5,
                display_order=1,
                status="active",
            ),
            Testimonial(
                tenant_id=t.id,
                customer_name="Maryam K.",
                customer_designation="Regular Client",
                customer_image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                review="The aesthetic is so editorial and minimal. The staff takes exceptional care and the treatments are truly transformative.",
                rating=5,
                display_order=2,
                status="active",
            ),
        ]
        session.add_all(testimonials)

        await session.commit()
        print("Successfully enriched Nofa Beauty Center with banners, categories, services, offers, and gallery images!")

if __name__ == "__main__":
    asyncio.run(enrich_nofa())

