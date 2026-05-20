"""Decode QR codes (and other barcodes) from images via pyzbar.

pyzbar links against the libzbar system library at import time, which can
fail on hosts where zbar isn't installed (CI containers, some macOS
brew setups). Importing lazily inside the entrypoint keeps the rest of
the backend serviceable on those hosts — the import only fires when the
QR-reader route is actually hit.
"""

from __future__ import annotations

import logging

from ..utils.exceptions import DependencyError, ValidationError
from ..utils.images import open_image_safe

logger = logging.getLogger(__name__)


def read_qr(image_path: str) -> list[dict]:
    """Decode QR codes (and other barcodes) from an image.

    Args:
        image_path: Path to the image file.

    Returns:
        List of dicts with keys: data, type, rect.
    """
    try:
        # Import inside the call so a missing libzbar doesn't poison the
        # whole services package import at server startup.
        from pyzbar.pyzbar import decode  # type: ignore[import-not-found]
    except ImportError as exc:
        raise DependencyError(
            "QR reader requires the zbar system library. "
            "Install with: apt-get install libzbar0 (Debian) or brew install zbar (macOS)."
        ) from exc

    with open_image_safe(image_path) as img:
        try:
            decoded = decode(img)
        except Exception as exc:
            # pyzbar wraps a C library — anything unexpected is treated as a
            # validation error so the user sees a sane message. Log only the
            # error class, not the path (server temp paths leak filesystem
            # layout to anyone with log access).
            logger.warning(
                "pyzbar decode failed",
                extra={"error_class": type(exc).__name__},
            )
            raise ValidationError("Could not decode QR codes from this image.") from exc

    results: list[dict] = []
    for obj in decoded:
        results.append({
            "data": obj.data.decode("utf-8", errors="replace"),
            "type": obj.type,
            "rect": {
                "left": obj.rect.left,
                "top": obj.rect.top,
                "width": obj.rect.width,
                "height": obj.rect.height,
            },
        })

    logger.info("qr_reader: decoded %d code(s)", len(results))
    return results
