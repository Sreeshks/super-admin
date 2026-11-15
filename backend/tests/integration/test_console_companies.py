import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_superadmin_create_company_atomic(
    client: AsyncClient,
    superadmin_headers,
    default_business_type,
):
    payload = {
        "company_name": "Royal Glamour Salon",
        "slug": "royal-glamour",
        "business_type_id": str(default_business_type.id),
        "admin_name": "John Doe",
        "admin_email": "john.glamour@example.com",
        "initial_password": "InitialSecret@123",
        "phone": "+919876543210",
        "address": "45 Park Street",
        "city": "Kolkata",
    }
    resp = await client.post("/api/v1/console/companies", json=payload, headers=superadmin_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert data["company"]["slug"] == "royal-glamour"
    assert data["admin_email"] == "john.glamour@example.com"
    assert "password_hash" not in str(body)  # Never leak password hash!


@pytest.mark.asyncio
async def test_duplicate_slug_rejected(
    client: AsyncClient,
    superadmin_headers,
    tenant_a,
    default_business_type,
):
    payload = {
        "company_name": "Another Company",
        "slug": "company-a",  # Already taken by tenant_a
        "business_type_id": str(default_business_type.id),
        "admin_name": "Jane Doe",
        "admin_email": "jane@example.com",
        "initial_password": "InitialSecret@123",
    }
    resp = await client.post("/api/v1/console/companies", json=payload, headers=superadmin_headers)
    assert resp.status_code == 409
    assert resp.json()["success"] is False


@pytest.mark.asyncio
async def test_duplicate_email_rejected(
    client: AsyncClient,
    superadmin_headers,
    tenant_a,
    default_business_type,
):
    payload = {
        "company_name": "Unique Salon",
        "slug": "unique-salon",
        "business_type_id": str(default_business_type.id),
        "admin_name": "Admin A",
        "admin_email": "admin@companya.com",  # Already registered
        "initial_password": "InitialSecret@123",
    }
    resp = await client.post("/api/v1/console/companies", json=payload, headers=superadmin_headers)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_company_soft_delete(
    client: AsyncClient,
    superadmin_headers,
    tenant_a,
):
    company_id = str(tenant_a["tenant"].id)
    resp = await client.delete(f"/api/v1/console/companies/{company_id}", headers=superadmin_headers)
    assert resp.status_code == 200

    # Public request should now 404
    pub_resp = await client.get(f"/api/v1/public/websites/{tenant_a['tenant'].slug}")
    assert pub_resp.status_code == 404

