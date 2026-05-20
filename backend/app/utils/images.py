"""Shared PIL image-open helper.

Centralises the ``Image.open()`` + size-guard + friendly-error pattern
that several services were copy-pasting. The global ``MAX_IMAGE_PIXELS``
cap in :mod:`app.utils.__init__` already protects us from
decompression-bomb OOMs at the bitmap-decode level; this helper adds a
typed error path so services don't all rediscover that ``UnidentifiedImageError``
and ``DecompressionBombError`` need to map to the same 400 status.

Use this from services that open an image file path directly. Code that
already needs raw PIL features (e.g. EXIF, frame iteration) can keep
calling ``Image.open()`` directly — this helper is meant for the common
"open it and convert to RGB" case.
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from PIL import Image, UnidentifiedImageError

from .exceptions import UnsupportedFileError, ValidationError


@contextmanager
def open_image_safe(
    path: str,
    *,
    convert: str | None = None,
) -> Iterator[Image.Image]:
    """Context-managed ``Image.open(path)`` with friendly errors.

    Args:
        path: filesystem path to the image.
        convert: optional PIL mode to convert to inside the context
            (e.g. ``"RGB"``). The conversion is done after the open so a
            corrupt image still raises the proper validation error.

    Raises:
        UnsupportedFileError: if PIL can't identify the format.
        ValidationError: if the image hits the decompression-bomb cap
            or otherwise fails to decode.
    """
    try:
        img = Image.open(path)
    except UnidentifiedImageError as exc:
        raise UnsupportedFileError(
            "This file isn't a supported image format."
        ) from exc
    except Image.DecompressionBombError as exc:
        raise ValidationError(
            "Image is too large to process safely."
        ) from exc
    except (OSError, ValueError) as exc:
        # Truncated files, broken headers, etc.
        raise ValidationError(f"Couldn't read image: {exc}") from exc

    try:
        if convert and img.mode != convert:
            img = img.convert(convert)
        yield img
    finally:
        try:
            img.close()
        except Exception:  # pragma: no cover — defensive
            pass


__all__ = ["open_image_safe"]
