import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_cross_tenant_category_isolation(
    client: AsyncClient,
    tenant_a_headers,
    tenant_b_headers,
):
    # Company B creates a category
    resp_b = await client.post(
        "/api/v1/admin/categories",
        json={"name": "Company B Exclusive Category"},
        headers=tenant_b_headers,
    )
    assert resp_b.status_code == 201
    cat_b_id = resp_b.json()["data"]["id"]

    # Company A Admin attempts to GET Company B's category -> MUST BE 404!
    resp_a_get = await client.get(
        f"/api/v1/admin/categories/{cat_b_id}",
        headers=tenant_a_headers,
    )
    assert resp_a_get.status_code == 404

    # Company A Admin attempts to UPDATE Company B's category -> MUST BE 404!
    resp_a_put = await client.put(
        f"/api/v1/admin/categories/{cat_b_id}",
        json={"name": "Hacked Name"},
        headers=tenant_a_headers,
    )
    assert resp_a_put.status_code == 404

    # Company A Admin attempts to DELETE Company B's category -> MUST BE 404!
    resp_a_del = await client.delete(
        f"/api/v1/admin/categories/{cat_b_id}",
        headers=tenant_a_headers,
    )
    assert resp_a_del.status_code == 404


@pytest.mark.asyncio
async def test_cross_tenant_service_isolation(
    client: AsyncClient,
    tenant_a_headers,
    tenant_b_headers,
):
    # Company B creates category and service
    cat_b = (
        await client.post(
            "/api/v1/admin/categories",
            json={"name": "Category B"},
            headers=tenant_b_headers,
        )
    ).json()["data"]["id"]

    srv_b = (
        await client.post(
            "/api/v1/admin/services",
            json={"category_id": cat_b, "name": "Company B Service", "regular_price": 100.0},
            headers=tenant_b_headers,
        )
    ).json()["data"]["id"]

    # Company A Admin attempts to GET Company B's service -> MUST BE 404!
    resp_a = await client.get(f"/api/v1/admin/services/{srv_b}", headers=tenant_a_headers)
    assert resp_a.status_code == 404

    # Company A Admin attempts to UPDATE Company B's service -> MUST BE 404!
    resp_a_upd = await client.put(
        f"/api/v1/admin/services/{srv_b}",
        json={"name": "Tampered Name"},
        headers=tenant_a_headers,
    )
    assert resp_a_upd.status_code == 404

    # Company A Admin attempts to DELETE Company B's service -> MUST BE 404!
    resp_a_del = await client.delete(f"/api/v1/admin/services/{srv_b}", headers=tenant_a_headers)
    assert resp_a_del.status_code == 404


@pytest.mark.asyncio
async def test_cross_tenant_enquiry_isolation(
    client: AsyncClient,
    tenant_a,
    tenant_a_headers,
    tenant_b_headers,
):
    # Customer submits enquiry to Company A
    await client.post(
        f"/api/v1/public/websites/{tenant_a['tenant'].slug}/enquiries",
        json={
            "customer_name": "Private Customer A",
            "email": "customerA@example.com",
            "message": "Confidential enquiry for company A",
        },
    )

    # Company B Admin lists enquiries -> MUST NOT contain Company A's enquiry!
    resp_b = await client.get("/api/v1/admin/contact/enquiries", headers=tenant_b_headers)
    assert resp_b.status_code == 200
    enquiries_b = resp_b.json()["data"]
    for e in enquiries_b:
        assert e["customer_name"] != "Private Customer A"

