# Multi-Tenant Business Website Management Platform Backend

A production-grade, secure, multi-tenant SaaS backend built with **FastAPI**, **PostgreSQL**, and **SQLAlchemy 2.0**.

Designed specifically to power three client applications:
1. **Super Admin Console**: Manage tenants, industry types, platform metrics, and subscriptions.
2. **Company Admin Panel**: Manage business profile, categories, services, offers, blogs, testimonials, hero banners, social links, FAQs, and website sections.
3. **Public Frontend Website**: Blazing-fast dynamic website content aggregated by company slug or verified custom domain.

---

## 🚀 Key Features & Architecture

- **Multi-Tenant SaaS Isolation**: Shared database with shared tables; every tenant-owned table is strictly bounded by `tenant_id` (UUID). Queries and mutations in the repository layer automatically enforce tenant scoping.
- **Strict Tenant Resolution**: Resolved from authenticated JWT claims (`COMPANY_ADMIN`) or verified domain/slug (`Public`). Untrusted clients cannot spoof tenant identity.
- **Authentication & RBAC**:
  - `Argon2id` password hashing.
  - Short-lived JWT access tokens (15 mins) and cryptographically secure SHA-256 hashed refresh tokens with rotation and reuse revocation detection.
  - Role-Based Access Control (`SUPER_ADMIN`, `COMPANY_ADMIN`, `CONTENT_MANAGER`).
  - Brute-force protection & account lockout after configurable failed attempts.
- **Granular Website Section Visibility**: Enable/disable sections (Hero, About, Categories, Services, Offers, Instagram, YouTube, Testimonials, FAQ, Blog, Contact, Footer). Disabled sections are automatically excluded from public website endpoints.
- **High-Volume Service CMS**: Optimized database pagination (`page`, `page_size`, `total_items`, `total_pages`, `has_next`, `has_previous`), searching, filtering by category/status/featured, and bulk operations.
- **Secure Media Management**: S3-compatible object storage with local storage fallback, MIME-type verification, Pillow image validation, size limits, and tenant-scoped paths (`tenants/{tenant_id}/...`).
- **Domain Verification & Entitlements**: Support for custom domains with DNS verification and centralized subscription plan entitlement checks.

---

## 🛠️ Technology Stack

- **Framework**: Python 3.12+, FastAPI, Uvicorn
- **Database**: PostgreSQL 16, SQLAlchemy 2.0 (Async ORM), Alembic migrations, psycopg / asyncpg
- **Validation**: Pydantic v2 & Pydantic Settings
- **Security**: Argon2 (argon2-cffi), PyJWT, Starlette Security Headers
- **Caching & Queues**: Redis 7, Celery
- **Media**: Pillow, Boto3 (S3 / MinIO)
- **Testing & Quality**: Pytest, Pytest-Asyncio, HTTPX, Ruff

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                  # Application entry point, CORS, middlewares, exception handlers
│   ├── core/                    # Settings, database engine, Argon2 security, RBAC permissions
│   ├── api/v1/
│   │   ├── auth/                # Login, refresh rotation, logout, password recovery
│   │   ├── console/             # Super Admin: Companies, Business Types, Dashboard, Subscriptions
│   │   ├── admin/               # Company Admin: Profile, Services, Offers, Banners, Blogs, Sections...
│   │   ├── public/              # Public Website: Dynamic aggregated payload, sitemap, enquiries
│   │   └── router.py            # API v1 aggregator
│   ├── models/                  # SQLAlchemy 2.0 models with UUIDs and soft delete
│   ├── schemas/                 # Pydantic v2 schemas and envelope responses
│   ├── repositories/            # Tenant-aware repositories with automatic isolation
│   ├── services/                # Business logic, atomic tenant provisioning, public aggregation
│   ├── dependencies/            # Auth claims extraction, tenant resolution, rate limiting
│   ├── middleware/              # Security headers (CSP, HSTS, X-Frame-Options)
│   ├── utils/                   # Slug generation, YouTube ID extraction & safe embed URLs
│   └── tasks/                   # Celery asynchronous task definitions
├── migrations/                  # Alembic migration scripts
├── tests/                       # Complete pytest suite (Unit, Integration, Security, Tenancy)
├── scripts/                     # Super Admin and Business Type seed scripts
├── storage/                     # Local file upload directory
├── Dockerfile                   # Production container definition
├── docker-compose.yml           # Full multi-container stack (FastAPI, PostgreSQL, Redis, Celery)
├── pyproject.toml               # Python package configuration
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in `backend/` (or copy from `.env.example`):

```ini
ENVIRONMENT=development
DEBUG=true
PROJECT_NAME="Multi-Tenant SaaS Website Management Platform"
API_V1_STR=/api/v1

SECRET_KEY=replace-with-a-32-character-random-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=30

MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@localhost:5432/nofa_db
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

STORAGE_PROVIDER=local
LOCAL_STORAGE_DIR=./storage
```

---

## 🏃 Getting Started (Local Development)

### 1. Set Up Virtual Environment & Dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
pip install -e ".[dev]"
```

### 2. Run Database Migrations

```bash
alembic upgrade head
```

### 3. Bootstrap Initial Platform Super Admin & Business Types

```bash
python scripts/create_superadmin.py
python scripts/seed_data.py
```

Default credentials generated:
- **Email**: `superadmin@platform.com`
- **Password**: `SuperAdmin@123456`

### 4. Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive API documentation will be available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health check**: `http://localhost:8000/health`

---

## 🐳 Running with Docker Compose

To launch the full production-ready stack (FastAPI Backend, PostgreSQL 16, Redis 7, Celery Worker):

```bash
docker compose up --build -d
```

Check logs:
```bash
docker compose logs -f backend
```

---

## 🧪 Running Automated Tests

Run the test suite with coverage:

```bash
pytest -v
```

### Test Scenarios Covered
- **Authentication**: Super Admin & Company Admin logins, password reset, token rotation, invalid credentials.
- **Account Lockout**: 5 failed consecutive attempts triggers timed account lockout.
- **Tenant Isolation**: Cross-tenant tests ensuring Company A can never view, update, delete, or leak Company B categories, services, offers, or customer enquiries.
- **Atomic Tenant Provisioning**: Super Admin creates company with company profile, default primary location, admin user, default sections, and audit log atomically in a single transaction.
- **Service Pagination & Category Association**: Database-level pagination with metadata, discounted price validation, and foreign key safety checks before category deletion.
- **Public Website Aggregation**: Single request payload respecting enabled section toggles (disabled sections are completely suppressed).
- **Public Enquiries**: Anonymous rate-limited customer enquiry submission.

---

## 🔒 Security Standards

1. **Least Privilege**: Super Admin endpoints strictly require `SUPER_ADMIN` role; tenant admin endpoints require `COMPANY_ADMIN` and check company ownership.
2. **Zero Plaintext Secrets**: Passwords hashed with `Argon2id`; refresh tokens and reset tokens stored exclusively as `SHA-256` hashes.
3. **No IDOR / Cross-Tenant Leaks**: All tenant repository queries append `tenant_id == self.tenant_id`. Client-provided tenant IDs are never trusted for company admins.
4. **Hardened HTTP Headers**: Strict `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `HSTS`.
5. **No Leaked Stack Traces**: Centralized exception handler prevents internal database errors from reaching the client.

