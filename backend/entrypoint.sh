#!/bin/sh
set -e

echo "==> Running database migrations..."
alembic upgrade head

echo "==> Ensuring initial Super Admin & platform plans exist..."
python scripts/create_superadmin.py || true
python scripts/seed_data.py || true

if [ "$AUTO_SEED_DEMO" = "true" ]; then
    echo "==> Seeding demo companies & media..."
    python scripts/seed_demo_company.py || true
    python scripts/populate_nofa_images.py || true
    python scripts/populate_social_media.py || true
fi

echo "==> Starting FastAPI application on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
