"""HTTP response caching helpers for idempotent endpoints.

Most of the routes that benefit from caching here (sitemap, og-image,
robots, llms.txt) are pure functions of either a URL path or a daily
mtime — the actual `bytes -> Response` plumbing for ETag, If-None-Match,
Last-Modified, and Cache-Control is identical across all of them.

This module centralises that plumbing so every route gets the same
behaviour:

- A short SHA-1 ETag derived from the body. The ETag also folds in the
  deploy-time `APP_VERSION` so a redeploy automatically invalidates
  every CDN/client cache without a manual purge.
- Honor ``If-None-Match`` → return ``304 Not Modified`` with no body.
- Honor ``If-Modified-Since`` → return ``304 Not Modified`` when the
  caller's timestamp is at-or-after the provided ``last_modified``.
- ``Cache-Control: public, max-age=N, stale-while-revalidate=M`` so
  Cloudflare can serve stale-while-revalidating without our origin
  seeing the bursty re-validation traffic.
- ``Vary: Accept-Encoding`` so gzip and identity bodies don't collide
  in upstream caches when the request travels through a chain of
  proxies that each apply their own compression.

Memory budget:
  Caching utilities themselves do NOT hold response bodies — the
  ``@lru_cache`` decorators in the calling routes (og_image.py,
  sitemap.py) carry the per-key bytes. Caps are documented per call
  site; total memory budget across all caches is ~64 MB.
"""
from __future__ import annotations

import hashlib
import os
from email.utils import formatdate, parsedate_to_datetime
from datetime import datetime, timezone
from typing import Optional

from fastapi import Request
from fastapi.responses import Response


# ---------------------------------------------------------------------------
# Deploy-version cache buster
# ---------------------------------------------------------------------------
# Read once at import time — the worker is reborn on every deploy, so the
# value is constant for the lifetime of the process. We fall back to the
# import-time wall clock if nothing is set so a dev restart still flushes
# the CDN, which is the safer default.
#
# Set ``APP_VERSION`` to a build hash (git short SHA, CI build number) in
# the deployment manifest to get deterministic ETag rotation on each
# release.
APP_VERSION: str = os.environ.get(
    "APP_VERSION",
    os.environ.get(
        "GIT_COMMIT",
        f"boot-{int(datetime.now(tz=timezone.utc).timestamp())}",
    ),
)


# Don't cache anything larger than this per response. OG PNGs sit at
# ~60 KB, sitemap.xml at ~30 KB, meta HTML at ~10 KB — 256 KB leaves
# generous headroom while keeping any pathological caller from blowing
# the worker RAM.
MAX_CACHEABLE_BYTES: int = 256 * 1024


def etag_for(body: bytes) -> str:
    """Compute a short, stable ETag for ``body``.

    SHA-1 hex truncated to 16 chars (64 bits of collision resistance —
    overkill for cache validation, but ETags are commonly grepped in
    logs so the short form is friendlier). The hash folds in
    :data:`APP_VERSION` so the ETag rotates on every deploy even when
    the body itself is byte-identical (e.g. JSON-LD that depends on
    code paths but not data).
    """
    h = hashlib.sha1()
    h.update(APP_VERSION.encode("utf-8"))
    h.update(b"\x00")  # separator so APP_VERSION can't collide with body prefix
    h.update(body)
    return h.hexdigest()[:16]


def _strip_etag_quotes(raw: str) -> str:
    """Strip surrounding quotes and a leading ``W/`` weak-validator prefix."""
    s = raw.strip()
    if s.startswith("W/"):
        s = s[2:]
    if len(s) >= 2 and s.startswith('"') and s.endswith('"'):
        s = s[1:-1]
    return s


def is_not_modified(request: Optional[Request], etag: str) -> bool:
    """Return True if the client's ``If-None-Match`` matches ``etag``.

    Per RFC 7232, ``If-None-Match`` may carry a comma-separated list of
    tags or the wildcard ``*``. We honour both forms. ETag comparison
    is "weak" (we ignore the ``W/`` prefix and surrounding quotes)
    because that is what every CDN does — clients sometimes downgrade
    strong ETags to weak ones in transit and a stricter rule would
    waste cache hits.
    """
    if request is None:
        return False
    header = request.headers.get("if-none-match")
    if not header:
        return False
    if header.strip() == "*":
        return True
    target = _strip_etag_quotes(etag)
    for candidate in header.split(","):
        if _strip_etag_quotes(candidate) == target:
            return True
    return False


def is_not_modified_since(
    request: Optional[Request], last_modified: Optional[datetime]
) -> bool:
    """Return True if the client's ``If-Modified-Since`` is >= ``last_modified``.

    Per RFC 7232, the server returns 304 when the resource has NOT been
    modified since the date the client sent. We compare with second
    resolution because HTTP-dates only carry that much, and we treat a
    timezone-naive ``last_modified`` as UTC.
    """
    if request is None or last_modified is None:
        return False
    header = request.headers.get("if-modified-since")
    if not header:
        return False
    try:
        client_dt = parsedate_to_datetime(header)
    except (TypeError, ValueError):
        return False
    if client_dt is None:
        return False
    # Normalise both to aware-UTC for an apples-to-apples comparison.
    if client_dt.tzinfo is None:
        client_dt = client_dt.replace(tzinfo=timezone.utc)
    if last_modified.tzinfo is None:
        last_modified = last_modified.replace(tzinfo=timezone.utc)
    # Truncate to seconds — HTTP-date has no sub-second precision.
    client_ts = int(client_dt.timestamp())
    server_ts = int(last_modified.timestamp())
    return client_ts >= server_ts


def _http_date(dt: datetime) -> str:
    """Format ``dt`` as an RFC 7231 IMF-fixdate (e.g. for Last-Modified)."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return formatdate(dt.timestamp(), usegmt=True)


def cache_response(
    body: bytes,
    *,
    media_type: str,
    max_age: int = 3600,
    stale_while_revalidate: int = 0,
    request: Optional[Request] = None,
    last_modified: Optional[datetime] = None,
    extra_headers: Optional[dict[str, str]] = None,
) -> Response:
    """Build a cacheable Response, returning 304 when validators match.

    Args:
        body: The serialized response body. If larger than
            :data:`MAX_CACHEABLE_BYTES`, ``Cache-Control: no-store`` is
            emitted instead — better to serve the bytes uncached than
            poison a CDN entry with an oversize payload.
        media_type: Standard MIME type, e.g. ``"application/xml"``.
        max_age: Cache-Control max-age in seconds.
        stale_while_revalidate: SWR window in seconds. 0 disables.
        request: The incoming Request, used to honour ``If-None-Match``
            and ``If-Modified-Since``. Optional so callers in non-route
            contexts (tests) can still build a Response.
        last_modified: When the underlying resource last changed. Sent
            as ``Last-Modified`` and matched against ``If-Modified-Since``.
        extra_headers: Optional extra headers to merge on top.

    Returns:
        A ``Response`` whose headers honour ETag + Last-Modified +
        Cache-Control + ``Vary: Accept-Encoding``. Returns a 304 with an
        empty body when the client's validators already match.
    """
    etag = etag_for(body)
    headers: dict[str, str] = {
        "ETag": f'"{etag}"',
        # Vary on Accept-Encoding so a CDN with gzip and a CDN without
        # don't collide on the same cache key. Starlette's GZipMiddleware
        # also emits this header when it actually applies gzip; the two
        # values are merged with a comma in the wire response, which all
        # CDNs (Cloudflare, Fastly, Varnish) dedupe semantically before
        # building the cache key. The duplicate is cosmetic, not a bug —
        # and we still need our own entry for responses that GZipMiddleware
        # doesn't touch (e.g. images, which are already compressed).
        "Vary": "Accept-Encoding",
    }
    if last_modified is not None:
        headers["Last-Modified"] = _http_date(last_modified)

    # Build Cache-Control. We only set it when the body is small enough
    # to be cacheable at all — otherwise we explicitly opt out so an
    # upstream cache doesn't store an oversize payload it'll evict on
    # the next request anyway.
    if len(body) > MAX_CACHEABLE_BYTES:
        headers["Cache-Control"] = "public, no-store"
    else:
        cc_parts = [f"public", f"max-age={max_age}"]
        if stale_while_revalidate > 0:
            cc_parts.append(f"stale-while-revalidate={stale_while_revalidate}")
        headers["Cache-Control"] = ", ".join(cc_parts)

    if extra_headers:
        # Caller-supplied headers win — they're the most specific.
        headers.update(extra_headers)

    # Conditional GET — short-circuit with 304 if either validator
    # matches. ETag is checked first (it's the precise validator);
    # If-Modified-Since is a fallback for clients that don't replay
    # ETags (curl --time-cond, some legacy crawlers).
    if is_not_modified(request, etag) or is_not_modified_since(request, last_modified):
        # 304 responses MUST NOT include a body. They SHOULD include the
        # same caching headers as a 200 so the client can refresh its
        # freshness counter without a re-validate next time.
        return Response(status_code=304, headers=headers)

    return Response(content=body, media_type=media_type, headers=headers)
