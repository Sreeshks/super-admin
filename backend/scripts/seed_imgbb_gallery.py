import asyncio
import os
import sys
import urllib.parse
import urllib.request
import json
import base64
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select, delete
from app.core.database import async_session_factory
from app.models.tenant import Tenant
from app.models.content import MediaAsset, Banner

API_KEY = "34b1022bc8d3afbe2dc9875cba76714d"
IMG_DIR = Path(r"C:\Users\Sreesh K Suresh\.gemini\antigravity\brain\9fa19576-7e9a-4922-ba23-ea5a8cae33ad\.user_uploaded")

GALLERY_MAP = [
    ("media_1794702355831_4ef86b39.webp", "INTERIOR", "Main Reception & Greeting Lounge"),
    ("media_1794702355895_761dbf55.webp", "HAIR TREATMENTS ROOMS", "Luxury Styling Atelier"),
    ("media_1794702355909_f273b246.webp", "RELAXATION AREA", "Hydrotherapy & Sanctuary"),
    ("media_1794702355921_a743dcda.webp", "SPA ZONE", "Aromatherapy Body Sanctuary"),
    ("media_1794702355945_c24d8620.webp", "SKIN CARE", "Facial & Glow Suites"),
    ("media_1794704713140_3bdd7341.jpg", "EDITORIAL HERO", "Signature Beauty Atelier"),
]


def upload_file(path: Path, name: str) -> str:
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    data = urllib.parse.urlencode({"image": b64, "name": name}).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.imgbb.com/1/upload?key={API_KEY}",
        data=data,
        method="POST",
        headers={"User-Agent": "Mozilla/5.0"},
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res["data"]["url"]


async def main():
    uploaded = []
    for filename, label, title in GALLERY_MAP:
        p = IMG_DIR / filename
        if p.exists():
            print(f"Uploading {filename} ({label}) to ImgBB...")
            try:
                clean_name = label.lower().replace(" ", "_")
                url = upload_file(p, clean_name)
                uploaded.append((url, filename, label, title, p.stat().st_size))
                print(f" -> ImgBB CDN: {url}")
            except Exception as e:
                print(f" -> Error: {e}")

    async with async_session_factory() as session:
        tenants = (await session.execute(select(Tenant))).scalars().all()
        for t in tenants:
            # Clear old gallery assets
            await session.execute(
                delete(MediaAsset).where(
                    MediaAsset.tenant_id == t.id,
                    MediaAsset.media_type == "gallery",
                )
            )

            # Insert all ImgBB uploaded assets
            for url, original_name, label, title, size in uploaded:
                asset = MediaAsset(
                    tenant_id=t.id,
                    file_name=f"{label.lower().replace(' ', '_')}.jpg",
                    original_name=f"{label} - {title}.jpg",
                    file_path=url,
                    file_url=url,
                    mime_type="image/jpeg",
                    file_size=size,
                    storage_provider="imgbb",
                    media_type="gallery",
                    metadata_info={"label": label, "alt_text": title},
                )
                session.add(asset)

            # Ensure banner also points to the ImgBB hero
            hero_url = uploaded[-1][0] if uploaded else "https://i.ibb.co/rGFt40gZ/nofa-luxury-hero.jpg"
            mobile_url = uploaded[1][0] if len(uploaded) > 1 else "https://i.ibb.co/5xtk4Jmm/nofa-mobile-portrait.webp"

            # Clear old banners
            await session.execute(delete(Banner).where(Banner.tenant_id == t.id))
            await session.flush()

            b1 = Banner(
                tenant_id=t.id,
                media_type="IMAGE",
                desktop_media_url=hero_url,
                mobile_media_url=mobile_url,
                heading=f"Your glow begins here. Welcome to {t.name}.",
                subtitle="BEAUTY SALON",
                description="Inspired by nature, light, and the soft rhythm of self-care. Where treatments restore natural balance and radiance.",
                cta_button_text="Book an Appointment",
                cta_button_url="#contact",
                display_order=1,
                status="active",
            )
            session.add(b1)
            print(f"Created ImgBB Banner & Gallery for {t.name} (slug: {t.slug})")

        await session.commit()
        print("\nAll gallery images and banners successfully stored in database with ImgBB CDN URLs!")


if __name__ == "__main__":
    asyncio.run(main())

