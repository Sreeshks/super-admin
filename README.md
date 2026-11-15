# Multi-Tenant Business Website Management Platform Backend

A complete, production-ready, multi-tenant SaaS backend built with **FastAPI**, **PostgreSQL**, and **SQLAlchemy 2.0**.

Serving three frontend applications:
1. **Super Admin Console** – manages all businesses and platform configurations.
2. **Company Admin Panel** – manages an individual company's website content.
3. **Public Frontend Website** – displays dynamic website content for each company.

---

## 🚀 Quick Start with Docker

```bash
docker compose up --build -d
```

Access Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🏃 Local Development Setup

```bash
# 1. Activate Virtual Environment
.\.venv\Scripts\activate

# 2. Run Migrations
cd backend
alembic upgrade head

# 3. Seed Initial Platform Super Admin & Business Types
python scripts/create_superadmin.py
python scripts/seed_data.py

# 4. Start Server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Run Tests
pytest -v
```

See `backend/README.md` for comprehensive architectural details, security specifications, and API documentation.

