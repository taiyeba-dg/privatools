"""
Rate limiting middleware for PrivaTools.
Uses in-memory tracking — no external dependencies.
Limits: 1000 requests/minute per IP (configurable via RATE_LIMIT_RPM env var).
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import os
import time


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 1000):
        super().__init__(app)
        self.rpm = int(os.environ.get("RATE_LIMIT_RPM", str(requests_per_minute)))
        self.window = 60  # seconds
        self.requests: dict[str, list[float]] = defaultdict(list)
        self.disabled = os.environ.get("DISABLE_RATE_LIMIT", "").strip().lower() in ("1", "true", "yes")

    async def dispatch(self, request: Request, call_next):
        if self.disabled:
            return await call_next(request)

        # Only rate-limit API endpoints (skip static files, health checks)
        if not request.url.path.startswith("/api/"):
            return await call_next(request)

        # Skip health check
        if request.url.path == "/api/health":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Clean old entries
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < self.window
        ]

        if len(self.requests[client_ip]) >= self.rpm:
            return Response(
                content='{"detail":"Rate limit exceeded. Please try again in a minute."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        self.requests[client_ip].append(now)
        response = await call_next(request)

        # Add rate limit headers
        remaining = self.rpm - len(self.requests[client_ip])
        response.headers["X-RateLimit-Limit"] = str(self.rpm)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))

        return response
