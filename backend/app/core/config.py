import os

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "Multi-Tenant SaaS Website Management Platform"
    API_V1_STR: str = "/api/v1"

    # Security & Tokens
    SECRET_KEY: str = "default-dev-insecure-secret-key-change-in-production-123456"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # Rate Limiting & Account Lockout
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/nofa_db"
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Storage Provider: "local", "s3", or "imgbb"
    STORAGE_PROVIDER: str = "imgbb"
    IMGBB_API_KEY: str = "34b1022bc8d3afbe2dc9875cba76714d"
    LOCAL_STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")
    S3_ENDPOINT_URL: str | None = None
    S3_ACCESS_KEY_ID: str | None = None
    S3_SECRET_ACCESS_KEY: str | None = None
    S3_BUCKET_NAME: str = "saas-platform-media"
    S3_REGION: str = "us-east-1"
    S3_PUBLIC_BASE_URL: str | None = None

    # Initial Super Admin Seed
    FIRST_SUPERADMIN_EMAIL: str = "superadmin@platform.com"
    FIRST_SUPERADMIN_PASSWORD: str = "SuperAdmin@123456"
    FIRST_SUPERADMIN_NAME: str = "Super Administrator"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore")


settings = Settings()
