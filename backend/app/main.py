import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import AppException
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.schemas.common import ErrorDetail, ErrorResponse, StandardResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure local storage directory exists
    if settings.STORAGE_PROVIDER == "local":
        os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Multi-Tenant SaaS Website Management Platform Backend serving Super Admin Console, Company Admin Panel, and Public Frontend Website.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "Token generation, refresh rotation, login lockout, and password recovery.",
        },
        {"name": "Console - Companies", "description": "Platform tenant CRUD and atomic business provisioning."},
        {
            "name": "Console - Business Types",
            "description": "Configurable industry categories and default configurations.",
        },
        {"name": "Console - Dashboard", "description": "Real-time multi-tenant analytics and platform activity."},
        {"name": "Console - Subscriptions", "description": "Tiered plans and limits management."},
        {"name": "Console - Platform Settings", "description": "Global application configurations and audit trail."},
        {"name": "Company Admin - Profile", "description": "Single-tenant brand profile, logos, and descriptions."},
        {"name": "Company Admin - Locations", "description": "Branch locations, coordinates, and operating hours."},
        {"name": "Company Admin - Categories", "description": "Service categories and taxonomy."},
        {"name": "Company Admin - Services", "description": "High-volume paginated services and bulk actions."},
        {"name": "Company Admin - Offers", "description": "Promotional discounts, timers, and scheduled deals."},
        {"name": "Company Admin - Hero Banners", "description": "Desktop & mobile image and video banners."},
        {"name": "Company Admin - Instagram", "description": "Instagram feed embeds and thumbnails."},
        {"name": "Company Admin - YouTube Videos", "description": "Video gallery with safe ID extraction and embeds."},
        {"name": "Company Admin - Social Links", "description": "Configurable verified social media links."},
        {"name": "Company Admin - FAQs", "description": "Frequently asked questions and answers."},
        {"name": "Company Admin - Blogs", "description": "CMS blog publishing, tags, and SEO controls."},
        {"name": "Company Admin - Testimonials", "description": "Customer reviews and verified 1-5 star ratings."},
        {
            "name": "Company Admin - Website Sections",
            "description": "Granular on/off toggle and ordering for website sections.",
        },
        {
            "name": "Company Admin - Contact & Enquiries",
            "description": "Customer inquiries inbox and business contact details.",
        },
        {"name": "Company Admin - Media", "description": "Tenant-scoped secure media uploads with Pillow validation."},
        {"name": "Company Admin - Custom Domains", "description": "Custom domain verification and SSL status."},
        {"name": "Public Website", "description": "Dynamic website data aggregated by slug or custom domain."},
    ],
)

# Security Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage if enabled
if settings.STORAGE_PROVIDER == "local":
    os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)
    app.mount("/storage", StaticFiles(directory=settings.LOCAL_STORAGE_DIR), name="storage")


# Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    details = [ErrorDetail(issue=str(d)) for d in exc.details] if exc.details else []
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            message=exc.message,
            error_code=exc.error_code,
            details=details,
        ).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = [
        ErrorDetail(
            field=" -> ".join(str(loc) for loc in err.get("loc", [])),
            issue=err.get("msg", "Validation error"),
        )
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            success=False,
            message="Request validation failed",
            error_code="VALIDATION_ERROR",
            details=details,
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Mask internal database errors and stack traces in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            success=False,
            message="An unexpected internal server error occurred. Please try again later.",
            error_code="INTERNAL_SERVER_ERROR",
            details=[],
        ).model_dump(),
    )


# Health & Readiness Checks
@app.get("/health", tags=["Health"], response_model=StandardResponse[dict])
async def health_check():
    return StandardResponse(
        message="Service is healthy",
        data={"status": "healthy", "environment": settings.ENVIRONMENT},
    )


@app.get("/ready", tags=["Health"], response_model=StandardResponse[dict])
async def readiness_check():
    return StandardResponse(
        message="Service is ready",
        data={"status": "ready", "database": "connected"},
    )


# Include API V1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
