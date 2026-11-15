import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_superadmin_login_success(client: AsyncClient, superadmin_user):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "superadmin@platform.com", "password": "SuperAdmin@123456"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "access_token" in body["data"]
    assert "refresh_token" in body["data"]


@pytest.mark.asyncio
async def test_company_admin_login_success(client: AsyncClient, tenant_a):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@companya.com", "password": "PasswordA@123"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["access_token"] is not None


@pytest.mark.asyncio
async def test_invalid_login_failure(client: AsyncClient, tenant_a):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@companya.com", "password": "WrongPassword999"},
    )
    assert resp.status_code == 401
    assert resp.json()["success"] is False


@pytest.mark.asyncio
async def test_refresh_token_rotation(client: AsyncClient, tenant_a):
    # 1. Login
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@companya.com", "password": "PasswordA@123"},
    )
    tokens = login_resp.json()["data"]
    raw_refresh = tokens["refresh_token"]

    # 2. Refresh
    refresh_resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": raw_refresh},
    )
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()["data"]
    assert new_tokens["access_token"] != tokens["access_token"]
    assert new_tokens["refresh_token"] != raw_refresh

    # 3. Attempt reuse of old refresh token -> Must be rejected!
    reuse_resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": raw_refresh},
    )
    assert reuse_resp.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_me(client: AsyncClient, tenant_a_headers):
    resp = await client.get("/api/v1/auth/me", headers=tenant_a_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["email"] == "admin@companya.com"
