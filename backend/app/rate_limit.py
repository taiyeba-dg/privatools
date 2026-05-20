"""Shared rate-limiter instance for per-route decorators.

`app.main` builds the FastAPI app, registers the exception handler, and
sets the default global limit. Routes that want a stricter per-route cap
(`@limiter.limit("5/minute")` on expensive jobs like OCR / URL→PDF /
LibreOffice conversions) import :data:`limiter` from this module rather
than from `app.main` — that would create a circular import, because
`app.main` imports every route module at startup.

The limit string is env-configurable so tests / staging can relax it
without code changes. ``RATE_LIMIT`` is the default applied to every
route; ``RATE_LIMIT_EXPENSIVE`` is the cap stamped on individual
heavy-job routes via :data:`EXPENSIVE_RATE_LIMIT`.
"""

from __future__ import annotations

import os

from slowapi import Limiter
from slowapi.util import get_remote_address

# Default applies to every route (slowapi's `default_limits`). Routes can
# override with their own decorator — `override_defaults=True` is slowapi's
# default behaviour.
_DEFAULT_RATE = os.environ.get("RATE_LIMIT", "30/minute")

# Stricter cap for routes that touch expensive resources (Tesseract,
# LibreOffice, ffmpeg, headless browsers). 5/min per-IP is plenty for any
# legitimate user — a real human won't OCR 6 PDFs in 60s, but an abusive
# script trying to wedge the worker pool absolutely will.
EXPENSIVE_RATE_LIMIT = os.environ.get("RATE_LIMIT_EXPENSIVE", "5/minute")

limiter = Limiter(key_func=get_remote_address, default_limits=[_DEFAULT_RATE])

__all__ = ["limiter", "EXPENSIVE_RATE_LIMIT"]
