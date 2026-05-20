"""Backend utility package.

Side-effect imports here run once at server boot — use them to set
process-wide safety defaults that every service should inherit, like
Pillow's decompression-bomb cap. Keeping these centralised means a new
service can't accidentally `Image.open(...)` a 4-GB TIFF and OOM the
worker just because it forgot to set a limit.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Pillow decompression-bomb cap
# ---------------------------------------------------------------------------
# Pillow normally warns at ~89M pixels and aborts at ~178M. That's too lenient
# for a public web service — a single 16384×16384 RGBA PNG decoded to bitmap
# already eats ~1 GB of RAM. Cap at ~150M pixels so a 12000×12000 image
# (well above any reasonable photo or scan) still works, but a 30000×30000
# image is rejected outright with a DecompressionBombError.
try:
    from PIL import Image as _PILImage

    # Only raise the limit if it's lower (cheap idempotency in tests).
    _CAP = 150_000_000
    if _PILImage.MAX_IMAGE_PIXELS is None or _PILImage.MAX_IMAGE_PIXELS > _CAP:
        _PILImage.MAX_IMAGE_PIXELS = _CAP
except Exception:  # pragma: no cover — Pillow is a hard dep, this is defence-in-depth
    pass
