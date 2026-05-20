"""Per-request structured access log.

One INFO line per request with the structured fields the JSON formatter
in :mod:`app.utils.logging` understands (``endpoint``, ``method``,
``status``, ``duration_ms``). Bumps to WARNING when a request runs longer
than ``SLOW_REQUEST_MS`` so slow tools jump out in the log stream.

Health probes and static-asset fetches are skipped — they fire many
times per minute from monitors / the browser and would drown out the
actual API traffic.

This middleware is intentionally minimal: it does NOT log the query
string, request body, response body, or user-supplied filename. Those
can carry PII. ``request.url.path`` is the routing template-ish path —
safe to log.
"""

from __future__ import annotations

import logging
import os
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from ..utils.logging import request_id_var

logger = logging.getLogger("privatools.access")


# Paths whose access logs are pure noise — health probes from
# load-balancers, static-asset fetches, browser favicon requests.
# Tuple form is intentional: starts-with comparison is O(prefix), and
# we don't expect this list to change at runtime.
_QUIET_PATH_PREFIXES = (
    "/healthz",
    "/readyz",
    "/api/health",
    "/assets/",
    "/icons/",
    "/favicon",
)


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None:
        return default
    try:
        return max(0, int(raw))
    except ValueError:
        return default


# Anything above this threshold (default 5s) gets WARNING instead of INFO
# so on-call eyes notice slow tools. Tunable via env so we can tighten
# during incident response.
_SLOW_REQUEST_MS = _env_int("SLOW_REQUEST_MS", 5000)


class AccessLogMiddleware(BaseHTTPMiddleware):
    """Emit one structured log line per HTTP request."""

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        path = request.url.path

        # Cheap fast-path for monitor/browser noise.
        for prefix in _QUIET_PATH_PREFIXES:
            if path.startswith(prefix):
                return await call_next(request)

        start = time.monotonic()
        status = 500  # Pre-set so we still log a value if call_next raises
        try:
            response = await call_next(request)
            status = response.status_code
            return response
        finally:
            duration_ms = round((time.monotonic() - start) * 1000)
            # contextvar fallback covers the (rare) case where this
            # middleware runs without RequestIDMiddleware in front of it.
            rid = (
                getattr(request.state, "request_id", None)
                or request_id_var.get()
                or "-"
            )
            extra = {
                "request_id": rid,
                "endpoint": path,
                "method": request.method,
                "status": status,
                "duration_ms": duration_ms,
            }
            # WARNING for slow requests — keeps the on-call signal: every
            # WARNING in the access stream means a single user-facing
            # operation took >5s, which is worth a glance.
            if duration_ms > _SLOW_REQUEST_MS:
                logger.warning(
                    "slow %s %s -> %d (%dms)",
                    request.method, path, status, duration_ms,
                    extra=extra,
                )
            else:
                logger.info(
                    "%s %s -> %d (%dms)",
                    request.method, path, status, duration_ms,
                    extra=extra,
                )
