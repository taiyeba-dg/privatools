"""Shared hex-color → RGB conversion.

Originally duplicated across redact, smart_redact, highlight, edit_pdf,
annotate, shapes, compare_visual and edit_pdf services — each with a
slightly different fallback (some returned black, some returned None,
some raised). This module centralises the logic and offers both 0–1
float tuples (for PyMuPDF / ReportLab) and 0–255 int tuples (for PIL).
"""

from __future__ import annotations

import re
from typing import Optional, Tuple

_HEX_RE = re.compile(r"^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")


def _normalize(hex_color: str) -> Optional[str]:
    """Return a clean 6-char lowercase hex string, or None if invalid."""
    if not hex_color:
        return None
    m = _HEX_RE.match(hex_color.strip())
    if not m:
        return None
    h = m.group(1).lower()
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return h


def hex_to_rgb_float(
    hex_color: str,
    default: Tuple[float, float, float] = (0.0, 0.0, 0.0),
) -> Tuple[float, float, float]:
    """Convert "#rrggbb" (or "#rgb") to (r, g, b) floats in 0-1 range.

    Returns `default` on any parse failure — callers that care about
    distinguishing invalid input from black should use `parse_hex_color()`.
    """
    h = _normalize(hex_color)
    if h is None:
        return default
    return (
        int(h[0:2], 16) / 255.0,
        int(h[2:4], 16) / 255.0,
        int(h[4:6], 16) / 255.0,
    )


def hex_to_rgb_int(
    hex_color: str,
    default: Tuple[int, int, int] = (0, 0, 0),
) -> Tuple[int, int, int]:
    """Convert "#rrggbb" (or "#rgb") to (r, g, b) ints in 0-255 range."""
    h = _normalize(hex_color)
    if h is None:
        return default
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def parse_hex_color(hex_color: str) -> Tuple[float, float, float]:
    """Like hex_to_rgb_float but raises ValueError on parse failure.

    Use this when an invalid color should be a hard user error, not
    silently defaulted to black (e.g. on the highlight tool).
    """
    h = _normalize(hex_color)
    if h is None:
        raise ValueError(
            f"Invalid hex color '{hex_color}'. Use a 3- or 6-digit hex like '#ff0000'."
        )
    return (
        int(h[0:2], 16) / 255.0,
        int(h[2:4], 16) / 255.0,
        int(h[4:6], 16) / 255.0,
    )
