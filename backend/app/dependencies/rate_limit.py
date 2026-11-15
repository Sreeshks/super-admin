import time
from collections import defaultdict

from fastapi import Request

from app.core.exceptions import RateLimitExceededException

# In-memory sliding window rate limiter
_request_records: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(key: str, max_requests: int, window_seconds: int) -> None:
    now = time.time()
    timestamps = _request_records[key]

    # Purge old records
    _request_records[key] = [t for t in timestamps if now - t < window_seconds]

    if len(_request_records[key]) >= max_requests:
        raise RateLimitExceededException(f"Rate limit exceeded. Please wait {window_seconds} seconds before retrying.")

    _request_records[key].append(now)


async def rate_limit_login(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    key = f"login:{client_ip}"
    check_rate_limit(key, max_requests=20, window_seconds=60)


async def rate_limit_public_enquiry(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    key = f"enquiry:{client_ip}"
    # Max 5 enquiries per 10 minutes per IP
    check_rate_limit(key, max_requests=5, window_seconds=600)
