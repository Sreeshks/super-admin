import sqlite3
import uuid
from datetime import datetime, timezone

DB_PATH = "backend/nofa_dev.db"

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    now = datetime.now(timezone.utc).isoformat()

    # Find nofa-beauty-center tenant id
    c.execute("SELECT id FROM tenants WHERE slug = 'nofa-beauty-center'")
    row = c.fetchone()
    if not row:
        print("Tenant nofa-beauty-center not found!")
        return
    nofa_tenant_id = row[0]

    # Find luxe-salon tenant id
    c.execute("SELECT id FROM tenants WHERE slug = 'luxe-salon'")
    row_luxe = c.fetchone()
    luxe_tenant_id = row_luxe[0] if row_luxe else None

    tenants = [("nofa-beauty-center", nofa_tenant_id)]
    if luxe_tenant_id:
        tenants.append(("luxe-salon", luxe_tenant_id))

    for slug, tid in tenants:
        print(f"\nProcessing tenant: {slug} ({tid})")

        # 1. Enable 'instagram' and 'youtube' in website_sections
        c.execute("SELECT id FROM website_sections WHERE tenant_id = ? AND section_key = 'instagram'", (tid,))
        if not c.fetchone():
            sec_id = uuid.uuid4().hex
            c.execute("""
                INSERT INTO website_sections (id, tenant_id, section_key, enabled, display_order, created_at, updated_at, is_deleted)
                VALUES (?, ?, 'instagram', 1, 6, ?, ?, 0)
            """, (sec_id, tid, now, now))
            print(" -> Created and enabled 'instagram' section")
        else:
            c.execute("UPDATE website_sections SET enabled = 1 WHERE tenant_id = ? AND section_key = 'instagram'", (tid,))
            print(" -> Enabled 'instagram' section")

        c.execute("SELECT id FROM website_sections WHERE tenant_id = ? AND section_key = 'youtube'", (tid,))
        if not c.fetchone():
            sec_id = uuid.uuid4().hex
            c.execute("""
                INSERT INTO website_sections (id, tenant_id, section_key, enabled, display_order, created_at, updated_at, is_deleted)
                VALUES (?, ?, 'youtube', 1, 7, ?, ?, 0)
            """, (sec_id, tid, now, now))
            print(" -> Created and enabled 'youtube' section")
        else:
            c.execute("UPDATE website_sections SET enabled = 1 WHERE tenant_id = ? AND section_key = 'youtube'", (tid,))
            print(" -> Enabled 'youtube' section")

        # 2. Seed Instagram Posts
        c.execute("DELETE FROM instagram_posts WHERE tenant_id = ?", (tid,))
        ig_posts = [
            (
                "https://www.instagram.com/p/DB123456789/",
                "Radiant bridal hair styling with bespoke botanical gloss atelier.",
                "https://i.ibb.co/5xtk4Jmm/nofa-mobile-portrait.webp",
                1
            ),
            (
                "https://www.instagram.com/p/DB987654321/",
                "Inside the thermal hydrotherapy sanctuary: serene mineral restoration.",
                "https://i.ibb.co/XrGGFNmC/relaxation-area.webp",
                2
            ),
            (
                "https://www.instagram.com/reel/DC112233445/",
                "Clinical precision meets aesthetic indulgence in our signature facial ritual.",
                "https://i.ibb.co/cVbSPkP/skin-care.webp",
                3
            ),
            (
                "https://www.instagram.com/p/DC556677889/",
                "Architectural calm: welcome to your wellness sanctuary in Muscat.",
                "https://i.ibb.co/WvYWvJ1g/interior.webp",
                4
            ),
        ]

        for post_url, caption, thumb_url, order in ig_posts:
            p_id = uuid.uuid4().hex
            c.execute("""
                INSERT INTO instagram_posts (id, tenant_id, post_url, caption, thumbnail_url, display_order, status, created_at, updated_at, is_deleted)
                VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, 0)
            """, (p_id, tid, post_url, caption, thumb_url, order, now, now))
        print(f" -> Inserted {len(ig_posts)} Instagram posts")

        # 3. Seed YouTube Videos (Popular beauty / spa / hair styling videos)
        c.execute("DELETE FROM youtube_videos WHERE tenant_id = ?", (tid,))
        yt_videos = [
            (
                "Luxury Beauty Salon & Spa Tour | Behind the Scenes",
                "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "dQw4w9WgXcQ",
                "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
                "Explore the architecture, relaxation suites, and treatment rooms designed for pure tranquility.",
                1
            ),
            (
                "Signature Hydration Facial & Skin Radiance Ritual",
                "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
                "kJQP7kiw5Fk",
                "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
                "Watch our master aesthetician perform our transformative deep hydration and cryo therapy sequence.",
                2
            ),
            (
                "Artisan Hair Balayage & Silk Care Masterclass",
                "https://www.youtube.com/watch?v=9bZkp7q19f0",
                "9bZkp7q19f0",
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
                "Delicate hair coloring and styling tailored to your natural movement and texture.",
                3
            ),
        ]

        for title, url, vid_id, thumb, desc, order in yt_videos:
            v_id = uuid.uuid4().hex
            c.execute("""
                INSERT INTO youtube_videos (id, tenant_id, title, video_url, youtube_video_id, thumbnail_url, description, display_order, status, created_at, updated_at, is_deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, 0)
            """, (v_id, tid, title, url, vid_id, thumb, desc, order, now, now))
        print(f" -> Inserted {len(yt_videos)} YouTube videos")

    conn.commit()
    conn.close()
    print("\nSocial media seeding completed successfully!")

if __name__ == "__main__":
    main()
