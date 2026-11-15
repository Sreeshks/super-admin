import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_rbac_company_admin_forbidden_from_console(
    client: AsyncClient,
    tenant_a_headers,
):
    # Company A Admin attempts to view platform dashboard stats
    resp = await client.get("/api/v1/console/dashboard/stats", headers=tenant_a_headers)
    assert resp.status_code == 403
    assert resp.json()["success"] is False
    assert resp.json()["error_code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_rbac_unauthenticated_request_rejected(client: AsyncClient):
    resp = await client.get("/api/v1/admin/profile")
    assert resp.status_code == 401
    assert resp.json()["success"] is False


@pytest.mark.asyncio
async def test_login_account_lockout(client: AsyncClient, tenant_a):
    email = tenant_a["user"].email

    # Submit 5 incorrect password attempts
    for _ in range(5):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "WrongPasswordAttempt"},
        )
        assert resp.status_code == 401

    # 6th attempt with correct password should still be LOCKED OUT!
    locked_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "PasswordA@123"},
    )
    assert locked_resp.status_code == 401
    assert "locked" in locked_resp.json()["message"].lower()

