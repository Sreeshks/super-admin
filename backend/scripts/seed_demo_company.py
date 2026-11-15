import asyncio
import os
import sys
import uuid
from datetime import UTC, datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import delete, select

from app.core.database import async_session_factory
from app.core.permissions import RoleEnum
from app.core.security import hash_password
from app.models.business_type import BusinessType
from app.models.content import (
    FAQ,
    Banner,
    Blog,
    Category,
    CompanyProfile,
    ContactDetails,
    Location,
    MediaAsset,
    Offer,
    Service,
    SocialLink,
    Testimonial,
    WebsiteSection,
)
from app.models.tenant import Tenant
from app.models.user import Role, User


async def seed_demo():
    async with async_session_factory() as session:
        # Check if tenant exists
        stmt_t = select(Tenant).where(Tenant.slug == "luxe-salon")
        tenant = (await session.execute(stmt_t)).scalars().first()

        # Fetch Salon Business Type
        stmt_bt = select(BusinessType).where(BusinessType.slug == "salon")
        bt = (await session.execute(stmt_bt)).scalars().first()
        bt_id = bt.id if bt else None

        # Fetch Roles
        stmt_ca_role = select(Role).where(Role.name == RoleEnum.COMPANY_ADMIN.value)
        ca_role = (await session.execute(stmt_ca_role)).scalars().first()

        if not tenant:
            tenant = Tenant(
                name="Lunaria Aesthetic & Wellness Salon",
                slug="luxe-salon",
                business_type_id=bt_id,
                website_status="active",
                account_status="active",
            )
            session.add(tenant)
            await session.flush()
        else:
            tenant.name = "Lunaria Aesthetic & Wellness Salon"
            session.add(tenant)

        tenant_id = tenant.id

        # Clean existing child records to allow complete refresh
        await session.execute(delete(Service).where(Service.tenant_id == tenant_id))
        await session.execute(delete(Category).where(Category.tenant_id == tenant_id))
        await session.execute(delete(Banner).where(Banner.tenant_id == tenant_id))
        await session.execute(delete(Offer).where(Offer.tenant_id == tenant_id))
        await session.execute(delete(MediaAsset).where(MediaAsset.tenant_id == tenant_id))
        await session.execute(delete(Testimonial).where(Testimonial.tenant_id == tenant_id))
        await session.execute(delete(FAQ).where(FAQ.tenant_id == tenant_id))
        await session.execute(delete(Blog).where(Blog.tenant_id == tenant_id))
        await session.execute(delete(WebsiteSection).where(WebsiteSection.tenant_id == tenant_id))
        await session.execute(delete(CompanyProfile).where(CompanyProfile.tenant_id == tenant_id))
        await session.execute(delete(ContactDetails).where(ContactDetails.tenant_id == tenant_id))
        await session.execute(delete(Location).where(Location.tenant_id == tenant_id))
        await session.execute(delete(SocialLink).where(SocialLink.tenant_id == tenant_id))

        # Check or Create Admin User
        stmt_user = select(User).where(User.email == "admin@luxesalon.com")
        admin_user = (await session.execute(stmt_user)).scalars().first()
        if not admin_user:
            admin_user = User(
                email="admin@luxesalon.com",
                full_name="Elena Rostova",
                password_hash=hash_password("CompanyAdmin@123"),
                is_active=True,
                tenant_id=tenant_id,
            )
            admin_user.roles.append(ca_role)
            session.add(admin_user)

        # Profile
        profile = CompanyProfile(
            tenant_id=tenant_id,
            company_name="Lunaria Aesthetic & Wellness Salon",
            logo="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            short_description="Inspired by nature, light, and the soft rhythm of self-care. Where skin treatments restore natural balance and radiance.",
            full_description="Lunaria was born from a simple belief: beauty is most powerful when it reflects how you feel inside. Inspired by nature, light, and the soft rhythm of self-care, our studio was created as a gentle space where women could reconnect with themselves — not just enhance their appearance.",
            about_section="We help create moments of beauty for you and your glow. Tailored aesthetic rituals for skin, body, and hair performed with intention and care.",
            phone="+1 (555) 234-5678",
            email="concierge@lunariasalon.com",
            whatsapp_number="+15552345678",
            address="428 Orchard Boulevard, Suite 100",
            city="Beverly Hills",
            state="CA",
            country="United States",
            postal_code="90210",
            latitude=34.0736,
            longitude=-118.4004,
            opening_hours={
                "monday": "9:00 AM - 8:00 PM",
                "tuesday": "9:00 AM - 8:00 PM",
                "wednesday": "9:00 AM - 8:00 PM",
                "thursday": "9:00 AM - 8:00 PM",
                "friday": "9:00 AM - 8:30 PM",
                "saturday": "9:00 AM - 7:00 PM",
                "sunday": "10:00 AM - 6:00 PM",
            },
        )
        session.add(profile)

        # Contact Details
        contact = ContactDetails(
            tenant_id=tenant_id,
            phone="+1 (555) 234-5678",
            whatsapp="+15552345678",
            business_email="concierge@lunariasalon.com",
            address="428 Orchard Boulevard, Suite 100, Beverly Hills, CA",
            map_url="https://maps.google.com/?q=Beverly+Hills+CA",
        )
        session.add(contact)

        # Location
        location = Location(
            tenant_id=tenant_id,
            location_name="Beverly Hills Flagship",
            address="428 Orchard Boulevard, Suite 100",
            city="Beverly Hills",
            state="CA",
            country="United States",
            postal_code="90210",
            contact_number="+1 (555) 234-5678",
            email="beverlyhills@lunariasalon.com",
            is_primary=True,
            status="active",
            latitude=34.0736,
            longitude=-118.4004,
        )
        session.add(location)

        # Website Sections
        sections_config = [
            ("hero", 1),
            ("about", 2),
            ("categories", 3),
            ("services", 4),
            ("gallery", 5),
            ("offers", 6),
            ("testimonials", 7),
            ("faq", 8),
            ("blog", 9),
            ("contact", 10),
        ]
        for key, order in sections_config:
            sec = WebsiteSection(
                tenant_id=tenant_id,
                section_key=key,
                enabled=True,
                display_order=order,
            )
            session.add(sec)

        # Hero Banner
        banner = Banner(
            tenant_id=tenant_id,
            heading="Your glow begins here. Welcome to Lunaria.",
            subtitle="BEAUTY SALON",
            description="Inspired by nature, light, and the soft rhythm of self-care. Book a personalized consultation to select treatments precisely crafted for you.",
            desktop_media_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1920&q=80",
            cta_button_text="Book an Appointment",
            cta_button_url="/luxe-salon/contact",
            status="active",
            display_order=1,
        )
        session.add(banner)

        # Categories
        cat_skin = Category(
            tenant_id=tenant_id,
            name="Skin Care",
            slug="skin-care",
            description="Inspired by nature, light, and the soft rhythm of self-care, our skin treatments are designed to restore balance, nourish deeply, and reveal your natural radiance.",
            image="https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=800&q=80",
            status="active",
            display_order=1,
        )
        cat_body = Category(
            tenant_id=tenant_id,
            name="Body Rituals",
            slug="body-rituals",
            description="Full-body tension relief, botanical salt exfoliation, and hot herbal compresses crafted to renew your posture and vitality.",
            image="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
            status="active",
            display_order=2,
        )
        cat_hair = Category(
            tenant_id=tenant_id,
            name="Hair Treatments",
            slug="hair-treatments",
            description="Precision cutting, organic scalp detox rituals, and dimensional hand-painted highlights designed for luminous shine.",
            image="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            status="active",
            display_order=3,
        )
        session.add_all([cat_skin, cat_body, cat_hair])
        await session.flush()

        # Services - Skin Care
        srv_skin_1 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="The Really Good Facial",
            slug="the-really-good-facial",
            short_description="The 60-minute personalized facial that transforms your skin and renews your confidence.",
            full_description="The 60-minute personalized facial that transforms your skin and renews your confidence.\n\nIDEAL FOR: Monthly maintenance and promoting overall skin health.\n\nWHAT'S INVOLVED:\n• Double Cleanse: Removes makeup, sweat, and dirt, leaving your skin fresh and ready for treatment.\n• Skin Analysis: Careful evaluation under magnification to customize serums.\n• Gentle Exfoliation & Ultrasonic Infusion\n• Calming Botanical Hydro-Jelly Mask",
            regular_price=140.0,
            discounted_price=140.0,
            duration_minutes=60,
            featured_image="https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=800&q=80",
            is_featured=True,
            status="active",
            display_order=1,
        )
        srv_skin_2 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="Dermaplaning",
            slug="dermaplaning",
            short_description="Removes dead skin and peach fuzz for a soft, smooth, radiant finish.",
            full_description="A surgical-grade manual exfoliation technique that sweeps away the outer layer of dead epidermal cells along with fine vellus hair (peach fuzz), allowing serums to penetrate 80% deeper.",
            regular_price=120.0,
            discounted_price=120.0,
            duration_minutes=60,
            featured_image="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
            is_featured=True,
            status="active",
            display_order=2,
        )
        srv_skin_3 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="Enzyme Exfoliation",
            slug="enzyme-exfoliation",
            short_description="Manual pore cleansing to remove blackheads, congestion, and impurities.",
            full_description="Organic fruit enzymes gently digest cellular debris and sebum plugs without mechanical abrasion, followed by targeted gentle extractions and a pore-refining mint lotion.",
            regular_price=110.0,
            discounted_price=110.0,
            duration_minutes=45,
            featured_image="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
            is_featured=True,
            status="active",
            display_order=3,
        )
        srv_skin_4 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="High Frequency",
            slug="high-frequency",
            short_description="Calms acne, boosts healing, and improves circulation using gentle electrical currents.",
            full_description="Enriched with argon and neon gas electrodes, this gentle treatment oxygenates the skin surface, neutralizes acne bacteria, and stimulates lymphatic drainage.",
            regular_price=90.0,
            discounted_price=90.0,
            duration_minutes=30,
            featured_image="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
            is_featured=False,
            status="active",
            display_order=4,
        )
        srv_skin_5 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="PureLift Technology",
            slug="purelift-technology",
            short_description="Microcurrent lifts and tones facial muscles for firmer, younger-looking skin.",
            full_description="Patented triple-wave microcurrent impulses activate deep facial muscle fibers, restoring tone to the jawline, lifting cheek contours, and diminishing fine expression lines.",
            regular_price=160.0,
            discounted_price=160.0,
            duration_minutes=60,
            featured_image="https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=800&q=80",
            is_featured=True,
            status="active",
            display_order=5,
        )
        srv_skin_6 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="Cryo Globe Massage",
            slug="cryo-globe-massage",
            short_description="Cooling globes reduce puffiness, soothe inflammation, and boost circulation.",
            full_description="Sub-zero stainless steel and crystal cryo spheres glide along lymph pathways, instantly constricting capillary redness, depuffing under-eyes, and locking in hydration.",
            regular_price=95.0,
            discounted_price=95.0,
            duration_minutes=30,
            featured_image="https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=800&q=80",
            is_featured=False,
            status="active",
            display_order=6,
        )
        srv_skin_7 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="Muscle Tension Relief",
            slug="muscle-tension-relief",
            short_description="Deep facial massage releases muscle tension and supports skin elasticity.",
            full_description="Focusing on the masseter, temporalis, and neck attachments, this bespoke sculptural buccal technique unbinds jaw tightness while visibly sculpting the mid-face.",
            regular_price=160.0,
            discounted_price=160.0,
            duration_minutes=60,
            featured_image="https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=800&q=80",
            is_featured=False,
            status="active",
            display_order=7,
        )
        srv_skin_8 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="Glow Facial",
            slug="glow-facial",
            short_description="Quick exfoliation and hydration for instant glow and refreshed skin.",
            full_description="The quintessential pre-event rejuvenation: gentle lactic exfoliation, vitamin cocktail misting, and cold rose quartz gua sha sculpting.",
            regular_price=130.0,
            discounted_price=130.0,
            duration_minutes=45,
            featured_image="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
            is_featured=True,
            status="active",
            display_order=8,
        )
        srv_skin_9 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="Vitamin C Infusion",
            slug="vitamin-c-infusion",
            short_description="Brightens complexion and protects skin with a potent antioxidant boost.",
            full_description="High-potency 20% L-ascorbic acid freshly prepared with ferulic acid, deeply pushed through sonophoresis to fade sun spots and neutralize free radicals.",
            regular_price=120.0,
            discounted_price=120.0,
            duration_minutes=60,
            featured_image="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
            is_featured=False,
            status="active",
            display_order=9,
        )
        srv_skin_10 = Service(
            tenant_id=tenant_id,
            category_id=cat_skin.id,
            name="Deep Hydration Facial",
            slug="deep-hydration-facial",
            short_description="Restores moisture using rich serums and calming massage techniques.",
            full_description="Multi-molecular hyaluronic acid combined with ceramide barrier repair balm, deeply infused under warm infrared light to quench dehydrated skin.",
            regular_price=180.0,
            discounted_price=180.0,
            duration_minutes=45,
            featured_image="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            is_featured=True,
            status="active",
            display_order=10,
        )

        # Services - Body Rituals
        srv_body_1 = Service(
            tenant_id=tenant_id,
            category_id=cat_body.id,
            name="Balinese Herbal Compress Therapy",
            slug="balinese-herbal-compress",
            short_description="Warm organic herbal compresses and calming essential oils to dissolve stress.",
            full_description="Steamed sachets filled with organic lemongrass, ginger root, and turmeric gently pressed along energy meridians to relieve deep muscular soreness.",
            regular_price=190.0,
            discounted_price=165.0,
            duration_minutes=90,
            featured_image="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
            is_featured=True,
            status="active",
            display_order=11,
        )

        # Services - Hair Treatments
        srv_hair_1 = Service(
            tenant_id=tenant_id,
            category_id=cat_hair.id,
            name="Couture Balayage & Botanical Gloss",
            slug="couture-balayage-gloss",
            short_description="Custom dimensional hand-painted highlights tailored to your skin tone.",
            full_description="Freehand dimensional painting tailored to harmonize with your complexion and eye color, followed by an ammonia-free acidic demi-permanent gloss.",
            regular_price=280.0,
            discounted_price=240.0,
            duration_minutes=180,
            featured_image="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
            is_featured=True,
            status="active",
            display_order=12,
        )

        session.add_all([
            srv_skin_1, srv_skin_2, srv_skin_3, srv_skin_4, srv_skin_5,
            srv_skin_6, srv_skin_7, srv_skin_8, srv_skin_9, srv_skin_10,
            srv_body_1, srv_hair_1,
        ])

        # Asymmetric Gallery Media Assets ("OUR SPACE")
        gallery_data = [
            {
                "file_name": "space_interior_01.webp",
                "label": "INTERIOR",
                "url": "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80",
                "alt": "Reception reception counter in warm limestone and fluted oak",
            },
            {
                "file_name": "space_relaxation_01.webp",
                "label": "RELAXATION AREA",
                "url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "alt": "Curved bouclé armchairs and warm arched backlit mirrors",
            },
            {
                "file_name": "space_hair_01.webp",
                "label": "HAIR TREATMENTS ROOMS",
                "url": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
                "alt": "Minimalist grooming chairs and floor-to-ceiling illuminated mirrors",
            },
            {
                "file_name": "space_doctor_01.webp",
                "label": "THE CHIEF DOCTOR'S OFFICE",
                "url": "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=1200&q=80",
                "alt": "Sculptural aesthetic consultation pod under warm circular halo lighting",
            },
            {
                "file_name": "space_spa_01.webp",
                "label": "SPA ZONE",
                "url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
                "alt": "Sunlit travertine spa lounge with warm teak wood daybeds",
            },
            {
                "file_name": "space_facial_01.webp",
                "label": "RELAXATION SUITE",
                "url": "https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=1200&q=80",
                "alt": "Private facial treatment bed with soft organic linen and diffused daylight",
            },
        ]

        for item in gallery_data:
            media = MediaAsset(
                tenant_id=tenant_id,
                file_name=item["file_name"],
                original_name=item["file_name"],
                file_path=f"storage/tenants/{tenant_id}/{item['file_name']}",
                file_url=item["url"],
                mime_type="image/webp",
                file_size=245000,
                storage_provider="external",
                media_type="gallery",
                metadata_info={"label": item["label"], "alt_text": item["alt"]},
            )
            session.add(media)

        # Offer
        offer1 = Offer(
            tenant_id=tenant_id,
            title="Introductory Aesthetic Privilege — 20% OFF",
            slug="introductory-privilege",
            short_description="Enjoy 20% savings on The Really Good Facial or Balinese Herbal Compress when booked for your initial consultation.",
            discount_percentage=20.0,
            regular_price=140.0,
            offer_price=112.0,
            banner_image="https://images.unsplash.com/photo-1512290900672-1f028479e491?auto=format&fit=crop&w=800&q=80",
            status="active",
            display_order=1,
        )
        session.add(offer1)

        # Testimonials
        t1 = Testimonial(
            tenant_id=tenant_id,
            customer_name="Melissa P.",
            customer_designation="Enzyme Exfoliation, Jun 26th, 2026",
            customer_image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
            review="My favorite stress reliever. There's nothing like ending the month with a visit to Lunaria. The atmosphere is so calming, the staff are always attentive, and I leave feeling like a new person. If I could come every week, I would!",
            rating=5,
            status="active",
            display_order=1,
        )
        t2 = Testimonial(
            tenant_id=tenant_id,
            customer_name="Sophie L.",
            customer_designation="Glow Revival Facial, Jul 6th, 2026",
            customer_image="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=300&q=80",
            review="My skin has never looked this radiant. One facial at Lunaria erased the dullness and gave me the confidence to go makeup-free. The care felt truly personal — I'm already booking my next visit.",
            rating=5,
            status="active",
            display_order=2,
        )
        t3 = Testimonial(
            tenant_id=tenant_id,
            customer_name="Rachel V.",
            customer_designation="PureLift Technology, Aug 12th, 2026",
            customer_image="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80",
            review="PureLift is magic. My jawline looks noticeably sculpted, and the neck tension I carried from work completely dissolved under the infrared compress.",
            rating=5,
            status="active",
            display_order=3,
        )
        session.add_all([t1, t2, t3])

        # FAQs
        faq1 = FAQ(
            tenant_id=tenant_id,
            question="Do I need to book an appointment in advance?",
            answer="While we accommodate walk-ins subject to therapist availability, we strongly recommend reserving your session 24 to 48 hours in advance to guarantee your preferred therapist and private suite.",
            status="active",
            display_order=1,
        )
        faq2 = FAQ(
            tenant_id=tenant_id,
            question="What is included in the initial skin analysis?",
            answer="Every facial begins with a magnified lamp assessment, moisture barrier check, and pore congestion mapping. We tailor your active serums and masks based on what your skin needs on that exact day.",
            status="active",
            display_order=2,
        )
        faq3 = FAQ(
            tenant_id=tenant_id,
            question="Are treatments suitable for sensitive or reactive skin?",
            answer="Yes. Our treatment protocols use hypoallergenic, organic, fragrance-free formulations and gentle cryotherapy to calm erythema and strengthen compromised lipid barriers.",
            status="active",
            display_order=3,
        )
        session.add_all([faq1, faq2, faq3])

        # Blogs (Newsletter / Editorial Journal)
        b1 = Blog(
            tenant_id=tenant_id,
            title="What Happens Beneath Skin As We Age?",
            slug="what-happens-beneath-skin-as-we-age",
            short_description="Understanding the slow decline of dermal fibroblasts, collagen bundle integrity, and how targeted peptide infusions revive elasticity.",
            full_content="<p>Beginning in our late twenties, intrinsic biological aging reduces collagen synthesis by approximately one percent annually. Meanwhile, repeated UV exposure and lifestyle oxidation compromise elastin cross-linking.</p><p>Understanding this architecture allows us to move beyond superficial moistening toward cellular signaling: microcurrent stimulation, cold-pressed botanical lipids, and focused peptides that awaken dormant fibroblasts.</p>",
            author="Dr. Clara Sterling",
            category="Skin Biology",
            status="published",
            published_date=datetime(2026, 6, 12, tzinfo=UTC),
            featured_image="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
        )
        b2 = Blog(
            tenant_id=tenant_id,
            title="What Is Perioral Dermatitis?",
            slug="what-is-perioral-dermatitis",
            short_description="Demystifying follicular redness around the mouth, the role of heavy occlusives, and zero-therapy recovery routines.",
            full_content="<p>Perioral dermatitis presents as small erythematous papules encircling the mouth, frequently confused with acne or rosacea. In many instances, the trigger is cosmetic over-saturation: layered heavy occlusives, topical steroids, or abrasive scrub particles that disrupt the skin microbiome.</p><p>The gentlest resolution is 'zero therapy' — cleansing exclusively with lukewarm thermal spring water and non-foaming cleansing milks until the barrier normalizes.</p>",
            author="Elena Rostova",
            category="Dermatology Insights",
            status="published",
            published_date=datetime(2026, 6, 19, tzinfo=UTC),
            featured_image="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
        )
        b3 = Blog(
            tenant_id=tenant_id,
            title="The Power of Combining Microneedling & Exosomes",
            slug="the-power-of-combining-microneedling-and-exosomes",
            short_description="Why nanovesicle signaling represents the gold standard of regenerative aesthetics without prolonged recovery downtime.",
            full_content="<p>Microneedling creates thousands of microscopic micro-channels through the stratum corneum. When paired with laboratory-purified plant and stem-cell exosomes, cellular communication cascades accelerate exponentially.</p><p>Clients notice rapid attenuation of post-inflammatory erythema and sustained neocollagenesis over six to twelve weeks.</p>",
            author="Dr. Clara Sterling",
            category="Regenerative Aesthetics",
            status="published",
            published_date=datetime(2026, 7, 8, tzinfo=UTC),
            featured_image="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
        )
        session.add_all([b1, b2, b3])

        # Social Link
        sl1 = SocialLink(
            tenant_id=tenant_id,
            platform="instagram",
            url="https://instagram.com/lunariasalon",
            status="active",
            display_order=1,
        )
        sl2 = SocialLink(
            tenant_id=tenant_id,
            platform="linkedin",
            url="https://linkedin.com/company/lunariasalon",
            status="active",
            display_order=2,
        )
        session.add_all([sl1, sl2])

        await session.commit()
        print("Demo tenant refreshed and seeded successfully with Lunaria editorial content!")


if __name__ == "__main__":
    asyncio.run(seed_demo())
