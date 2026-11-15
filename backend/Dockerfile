FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies (build-essential, libpq-dev for PostgreSQL, curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Copy project specification & dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application codebase
COPY . .

# Ensure Unix line endings and execute permissions for entrypoint
RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose standard API port
EXPOSE 8000

# Run migrations, bootstrap, and start server
CMD ["/app/entrypoint.sh"]
