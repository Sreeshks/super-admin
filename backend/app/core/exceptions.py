from typing import Any

from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str = "APP_ERROR",
        details: list[Any] | None = None,
    ):
        super().__init__(status_code=status_code, detail=message)
        self.message = message
        self.error_code = error_code
        self.details = details or []


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: list[Any] | None = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=message,
            error_code="NOT_FOUND",
            details=details,
        )


class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request", details: list[Any] | None = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            error_code="BAD_REQUEST",
            details=details,
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", details: list[Any] | None = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            error_code="UNAUTHORIZED",
            details=details,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Permission denied", details: list[Any] | None = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            error_code="FORBIDDEN",
            details=details,
        )


class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists", details: list[Any] | None = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            message=message,
            error_code="CONFLICT",
            details=details,
        )


class RateLimitExceededException(AppException):
    def __init__(
        self, message: str = "Rate limit exceeded. Please try again later.", details: list[Any] | None = None
    ):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            message=message,
            error_code="RATE_LIMIT_EXCEEDED",
            details=details,
        )


class TenantAccessDeniedException(ForbiddenException):
    def __init__(self, message: str = "Access to requested tenant is unauthorized"):
        super().__init__(message=message, details=[{"reason": "Tenant isolation violation"}])
