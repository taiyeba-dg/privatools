"""Shared PDF page-range parser.

Originally duplicated across extract_pages, delete_pages, rotate, stamp,
table_extractor, nup, and split services with subtle differences (some
silently dropped out-of-range pages, some used "end" keyword, etc.). This
module centralises the parser so behaviour is consistent and bugs only need
to be fixed once.

Syntax supported:
    "all"               → every page (0..total-1)
    "1,3,5"             → individual pages
    "1-3,5,7-end"       → ranges with optional "end" sentinel
    "-3,8-"             → open ranges (start = 1, end = total)
    "  1 , 2 "          → whitespace tolerated

Always returns a deduplicated 0-indexed list, preserving the order pages
were referenced.
"""

from __future__ import annotations

from typing import List

# Hard cap on numbers a user can write in a page-range token. Without this,
# `int("9" * 10_000_000)` blows up RAM before we ever reach the bounds check.
_MAX_TOKEN_DIGITS = 9  # supports up to 999_999_999 pages — well past any real PDF


def _to_page(token: str, total_pages: int) -> int:
    if len(token) > _MAX_TOKEN_DIGITS:
        raise ValueError(f"Page number '{token[:20]}…' is too large.")
    if not token.isdigit():
        raise ValueError(f"Invalid page number '{token}'.")
    p = int(token)
    if p < 1 or p > total_pages:
        raise ValueError(
            f"Page {p} is out of bounds. Valid range is 1-{total_pages}."
        )
    return p


def parse_page_range(
    spec: str,
    total_pages: int,
    *,
    allow_empty: bool = False,
) -> List[int]:
    """Convert a user-supplied page-range string into a 0-indexed list.

    Args:
        spec: page-range string such as "1-3,5,7-end" or "all".
        total_pages: number of pages in the source PDF.
        allow_empty: if True, an empty/blank spec returns []; otherwise raises.

    Raises:
        ValueError: on syntax or out-of-bounds errors.
    """
    if total_pages <= 0:
        raise ValueError("Cannot parse a page range on an empty PDF.")

    spec = (spec or "").strip().lower()
    if not spec:
        if allow_empty:
            return []
        raise ValueError(
            "No page range provided. Please specify pages (e.g. '1-3,5,7-end')."
        )
    if spec == "all":
        return list(range(total_pages))

    out: List[int] = []
    seen: set[int] = set()
    for part in spec.split(","):
        token = part.strip()
        if not token:
            continue
        if "-" in token:
            start_raw, end_raw = (x.strip() for x in token.split("-", 1))
            if not start_raw and not end_raw:
                raise ValueError(f"Invalid range '{token}'.")
            start = 1 if start_raw == "" else _to_page(start_raw, total_pages)
            end = (
                total_pages
                if end_raw in ("", "end")
                else _to_page(end_raw, total_pages)
            )
            if start > end:
                raise ValueError(
                    f"Invalid range '{token}': start page must be <= end page."
                )
            for p in range(start, end + 1):
                if p - 1 not in seen:
                    seen.add(p - 1)
                    out.append(p - 1)
        else:
            # Standalone "end" — equivalent to total_pages.
            if token == "end":
                p = total_pages
            else:
                p = _to_page(token, total_pages)
            if p - 1 not in seen:
                seen.add(p - 1)
                out.append(p - 1)
    if not out:
        raise ValueError(f"Page range '{spec}' selected zero pages.")
    return out
