#!/bin/sh
set -e

echo "==> Waiting for PostgreSQL database connection..."
python -c "
import asyncio, os, sys, time
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def wait_db():
    url = os.environ.get('DATABASE_URL', '')
    masked_url = url.split('@')[-1] if '@' in url else url
    print(f'Attempting connection to database: {masked_url}')
    for attempt in range(1, 31):
        try:
            engine = create_async_engine(url, echo=False)
            async with engine.connect() as conn:
                await conn.execute(text('SELECT 1'))
            await engine.dispose()
            print(f'==> Database connection successful on attempt {attempt}!')
            return
        except Exception as e:
            print(f'Database not ready yet (attempt {attempt}/30): {e}')
            await asyncio.sleep(2)
    print('==> ERROR: Could not connect to database after 30 attempts.')
    sys.exit(1)

asyncio.run(wait_db())
"

echo "==> Running Alembic migrations..."
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
