# Deploying to Dokploy

This guide outlines how to deploy the entire multi-tenant platform (PostgreSQL, Redis, FastAPI Backend, Public Frontend, Company Admin, and Super Admin) onto [Dokploy](https://dokploy.com).

---

## Architecture Overview

| Service | Port | Default Subdomain Suggestion | Technology |
| :--- | :--- | :--- | :--- |
| **Backend API** | `8000` | `api.yourdomain.com` | FastAPI + Uvicorn + Python 3.12 |
| **Frontend Website** | `3000` | `yourdomain.com` | Next.js 16 (Standalone SSR) |
| **Company Admin** | `3000` | `admin.yourdomain.com` | Next.js 16 (Standalone SSR) |
| **Super Admin** | `3000` | `super.yourdomain.com` | Next.js 16 (Standalone SSR) |
| **PostgreSQL** | `5432` | Internal | PostgreSQL 16 Alpine |
| **Redis** | `6379` | Internal | Redis 7 Alpine |

---

## Method 1: Deploy as a Dokploy Compose Stack (Recommended)

This is the fastest method. Dokploy builds and launches all 7 containers directly from the repository's `docker-compose.yml`.

### Step 1: Create a Project in Dokploy
1. Open your Dokploy dashboard (`https://your-dokploy-instance.com`).
2. Click **Create Project** and name it `nofa-platform`.

### Step 2: Add a Compose Service
1. Inside your project, click **Create Service** and select **Compose**.
2. Give it a name (e.g. `nofa-stack`).
3. Under **Source Type**, select **Git Repository**:
   - Repository URL: `https://github.com/Sreeshks/<your-repo>.git`
   - Branch: `main`
   - Compose Path: `docker-compose.yml`

### Step 3: Configure Environment Variables
In the **Environment** tab of the Compose service in Dokploy, paste the values (refer to `.env.production.example`):

```env
POSTGRES_DB=nofa_db
POSTGRES_USER=nofa_user
POSTGRES_PASSWORD=your_strong_postgres_password

ENVIRONMENT=production
DEBUG=false
SECRET_KEY=change_this_to_a_random_32_character_string_for_security
CORS_ORIGINS=["https://yourdomain.com","https://admin.yourdomain.com","https://super.yourdomain.com"]

FIRST_SUPERADMIN_EMAIL=superadmin@yourdomain.com
FIRST_SUPERADMIN_PASSWORD=SuperAdmin@Secure123!
FIRST_SUPERADMIN_NAME="Super Administrator"
AUTO_SEED_DEMO=true

PUBLIC_API_URL=https://api.yourdomain.com/api/v1
PLATFORM_DOMAIN=yourdomain.com
DEFAULT_TENANT_SLUG=nofa-beauty-center
COMPANY_ADMIN_NAME="Nofa Business Manager"
SUPER_ADMIN_NAME="Nofa SaaS Console"
```

### Step 4: Map Domains & SSL
In Dokploy's **Domains** section for the Compose service, create domain mappings with automatic Let's Encrypt SSL:

1. **Backend API**:
   - Domain: `api.yourdomain.com`
   - Service: `backend`
   - Container Port: `8000`
   - HTTPS: Enabled (Let's Encrypt)

2. **Public Website**:
   - Domain: `yourdomain.com` (and `*.yourdomain.com` if using wildcard custom domains)
   - Service: `frontend`
   - Container Port: `3000`
   - HTTPS: Enabled

3. **Company Admin**:
   - Domain: `admin.yourdomain.com`
   - Service: `company_admin`
   - Container Port: `3000`
   - HTTPS: Enabled

4. **Super Admin**:
   - Domain: `super.yourdomain.com`
   - Service: `super_admin`
   - Container Port: `3000`
   - HTTPS: Enabled

### Step 5: Deploy
Click **Deploy**. Dokploy will pull the code, build the Docker images, run database migrations, seed the initial Super Admin account, and launch the platform with automatic SSL.

---

## Method 2: Deploy as Individual Dokploy Applications

If you prefer managing each container as a distinct Dokploy Application:

1. **Databases**:
   - Create a **PostgreSQL** database service in Dokploy.
   - Create a **Redis** database service in Dokploy.
2. **Backend**:
   - Create an **Application** in Dokploy.
   - Source: Git repo.
   - Build Type: **Dockerfile**.
   - Dockerfile path: `/backend/Dockerfile`. Context: `/backend`.
   - Port: `8000`. Domain: `api.yourdomain.com`.
3. **Public Frontend**:
   - Create an **Application**.
   - Build Type: **Dockerfile**.
   - Dockerfile path: `/frontend/Dockerfile`. Context: `/frontend`.
   - Build Args: `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1`.
   - Port: `3000`. Domain: `yourdomain.com`.
4. **Company Admin**:
   - Build Type: **Dockerfile**.
   - Dockerfile path: `/company-admin/Dockerfile`. Context: `/company-admin`.
   - Build Args: `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1`.
   - Port: `3000`. Domain: `admin.yourdomain.com`.
5. **Super Admin**:
   - Build Type: **Dockerfile**.
   - Dockerfile path: `/super-admin/Dockerfile`. Context: `/super-admin`.
   - Build Args: `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1`.
   - Port: `3000`. Domain: `super.yourdomain.com`.
