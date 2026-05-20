"""Shared temp-output filename helper.

Originally every service grew its own copy of::

    output_path = get_temp_path(f"{my_prefix}_{uuid.uuid4().hex}.{ext}")

— 113 call-sites at last count. This module centralises the pattern so
the temp-file naming convention (prefix + 32-char hex + extension) lives
in exactly one place, and so callers don't have to remember to import
both ``uuid`` and ``get_temp_path``.

Keep this module dependency-free besides stdlib + ``cleanup`` — it gets
imported by almost every service.
"""

from __future__ import annotations

import uuid
from pathlib import Path

from .cleanup import ensure_temp_dir, get_temp_path


def temp_output(prefix: str, ext: str | None = None) -> Path:
    """Return a unique path inside the temp dir with shape ``<prefix>_<hex>.<ext>``.

    Always calls :func:`ensure_temp_dir` first so callers don't have to.

    Args:
        prefix: short tag for the tool that owns the file. Kept in the
            filename so a leftover file in the temp dir is greppable
            (``ls temp/ | grep watermark``).
        ext: extension without the leading dot. Pass ``None`` to omit it
            entirely (handy for python-barcode which appends its own
            extension).

    Returns:
        :class:`pathlib.Path` — caller decides whether to ``str()`` it.
    """
    ensure_temp_dir()
    safe_prefix = (prefix or "out").strip().replace("/", "_").replace("\\", "_")
    suffix = f".{ext.lstrip('.')}" if ext else ""
    return get_temp_path(f"{safe_prefix}_{uuid.uuid4().hex}{suffix}")


__all__ = ["temp_output"]
