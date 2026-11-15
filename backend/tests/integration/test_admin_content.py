import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_category_and_service_crud_with_association_check(
    client: AsyncClient,
    tenant_a_headers,
):
    # 1. Create Category
    cat_payload = {
        "name": "Hair Styling",
        "description": "Premium cuts and styling",
    }
    cat_resp = await client.post("/api/v1/admin/categories", json=cat_payload, headers=tenant_a_headers)
    assert cat_resp.status_code == 201
    cat_id = cat_resp.json()["data"]["id"]

    # 2. Create Service under this Category
    srv_payload = {
        "category_id": cat_id,
        "name": "Deluxe Haircut",
        "regular_price": 50.0,
        "discounted_price": 40.0,
        "duration_minutes": 45,
        "is_featured": True,
    }
    srv_resp = await client.post("/api/v1/admin/services", json=srv_payload, headers=tenant_a_headers)
    assert srv_resp.status_code == 201
    srv_id = srv_resp.json()["data"]["id"]

    # 3. Attempting to delete Category with associated service must fail with 400!
    del_cat_resp = await client.delete(f"/api/v1/admin/categories/{cat_id}", headers=tenant_a_headers)
    assert del_cat_resp.status_code == 400
    assert "associated" in del_cat_resp.json()["message"]

    # 4. Delete Service first
    del_srv_resp = await client.delete(f"/api/v1/admin/services/{srv_id}", headers=tenant_a_headers)
    assert del_srv_resp.status_code == 200

    # 5. Now delete Category succeeds
    del_cat_ok = await client.delete(f"/api/v1/admin/categories/{cat_id}", headers=tenant_a_headers)
    assert del_cat_ok.status_code == 200


@pytest.mark.asyncio
async def test_service_price_validation(client: AsyncClient, tenant_a_headers):
    # Create category
    cat_resp = await client.post(
        "/api/v1/admin/categories",
        json={"name": "Nail Art"},
        headers=tenant_a_headers,
    )
    cat_id = cat_resp.json()["data"]["id"]

    # Invalid: discounted price >= regular price
    invalid_payload = {
        "category_id": cat_id,
        "name": "Gel Nails",
        "regular_price": 30.0,
        "discounted_price": 35.0,  # Invalid!
    }
    resp = await client.post("/api/v1/admin/services", json=invalid_payload, headers=tenant_a_headers)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_service_pagination_and_filtering(client: AsyncClient, tenant_a_headers):
    cat_resp = await client.post(
        "/api/v1/admin/categories",
        json={"name": "Massage Therapy"},
        headers=tenant_a_headers,
    )
    cat_id = cat_resp.json()["data"]["id"]

    # Seed 5 services
    for i in range(5):
        await client.post(
            "/api/v1/admin/services",
            json={
                "category_id": cat_id,
                "name": f"Massage Option {i}",
                "regular_price": 60.0 + i,
            },
            headers=tenant_a_headers,
        )

    # Test pagination
    list_resp = await client.get("/api/v1/admin/services?page=1&page_size=2", headers=tenant_a_headers)
    assert list_resp.status_code == 200
    body = list_resp.json()
    assert body["pagination"]["page"] == 1
    assert body["pagination"]["page_size"] == 2
    assert body["pagination"]["total_items"] >= 5
    assert len(body["data"]) == 2
    assert body["pagination"]["has_next"] is True


@pytest.mark.asyncio
async def test_website_section_toggle(client: AsyncClient, tenant_a_headers):
    # Toggle 'faq' section to enabled=true
    resp = await client.put(
        "/api/v1/admin/sections/faq",
        json={"enabled": True, "display_order": 9},
        headers=tenant_a_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"]["enabled"] is True

