import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_public_website_aggregated_endpoint(client: AsyncClient, tenant_a):
    slug = tenant_a["tenant"].slug

    resp = await client.get(f"/api/v1/public/websites/{slug}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    data = body["data"]

    assert data["company"]["slug"] == slug
    assert "categories" in data
    assert "services" in str(data)
    assert "banners" in data


@pytest.mark.asyncio
async def test_public_website_disabled_section_hidden(
    client: AsyncClient,
    tenant_a,
    tenant_a_headers,
):
    # 1. Add an FAQ under Tenant A
    await client.post(
        "/api/v1/admin/faqs",
        json={"question": "Do you accept card payments?", "answer": "Yes, all major credit cards."},
        headers=tenant_a_headers,
    )

    # 2. In tenant_a fixture, 'faq' section is set to enabled=False
    # Ensure it is disabled
    await client.put(
        "/api/v1/admin/sections/faq",
        json={"enabled": False},
        headers=tenant_a_headers,
    )

    # 3. Query public website: 'faqs' list MUST be empty because section is disabled!
    slug = tenant_a["tenant"].slug
    resp = await client.get(f"/api/v1/public/websites/{slug}")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["faqs"]) == 0


@pytest.mark.asyncio
async def test_public_enquiry_submission(client: AsyncClient, tenant_a):
    slug = tenant_a["tenant"].slug
    payload = {
        "customer_name": "Alice Smith",
        "email": "alice@example.com",
        "phone": "+919876543210",
        "subject": "Bridal Package Inquiry",
        "message": "Hi, I would like to book a bridal package for December.",
    }
    resp = await client.post(f"/api/v1/public/websites/{slug}/enquiries", json=payload)
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["customer_name"] == "Alice Smith"


@pytest.mark.asyncio
async def test_public_domain_resolution(client: AsyncClient, tenant_a, db_session):
    from app.models.domain import CustomDomain

    # Insert a verified active custom domain directly
    cd = CustomDomain(
        tenant_id=tenant_a["tenant"].id,
        domain="luxury-spa.example.com",
        verification_status="verified",
        verification_token_hash="fakehash",
        status="active",
        is_primary=True,
    )
    db_session.add(cd)
    await db_session.commit()

    # Test resolve domain
    resolve_resp = await client.get("/api/v1/public/websites/resolve/domain?domain=luxury-spa.example.com")
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["data"]["slug"] == tenant_a["tenant"].slug


@pytest.mark.asyncio
async def test_public_sitemap_generation(client: AsyncClient, tenant_a):
    slug = tenant_a["tenant"].slug
    resp = await client.get(f"/api/v1/public/websites/{slug}/sitemap")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]["urls"]) > 0


@pytest.mark.asyncio
async def test_public_service_and_blog_by_slug(client: AsyncClient, tenant_a, tenant_a_headers):
    slug = tenant_a["tenant"].slug

    # 1. Create a service and test public fetch by slug
    cat_resp = await client.post(
        "/api/v1/admin/categories",
        json={"name": "Hair Treatments", "slug": "hair-treatments"},
        headers=tenant_a_headers,
    )
    cat_id = cat_resp.json()["data"]["id"]

    srv_resp = await client.post(
        "/api/v1/admin/services",
        json={
            "name": "Keratin Therapy",
            "slug": "keratin-therapy",
            "category_id": cat_id,
            "regular_price": 199.99,
            "duration_minutes": 90,
        },
        headers=tenant_a_headers,
    )
    assert srv_resp.status_code == 201

    get_srv = await client.get(f"/api/v1/public/websites/{slug}/services/keratin-therapy")
    assert get_srv.status_code == 200
    assert get_srv.json()["data"]["name"] == "Keratin Therapy"

    # 2. Create a blog and test public fetch by slug
    blog_resp = await client.post(
        "/api/v1/admin/blogs",
        json={
            "title": "Summer Hair Care Tips",
            "slug": "summer-hair-care-tips",
            "full_content": "<p>Protect your hair from UV rays...</p>",
            "status": "published",
        },
        headers=tenant_a_headers,
    )
    assert blog_resp.status_code == 201

    get_blog = await client.get(f"/api/v1/public/websites/{slug}/blogs/summer-hair-care-tips")
    assert get_blog.status_code == 200
    assert get_blog.json()["data"]["title"] == "Summer Hair Care Tips"


