"""Extract and return EXIF / IPTC / XMP / image metadata as a JSON-able dict.

Counterpart to /api/remove-exif — this one *shows* you what's in there.
Pure-read, never writes to disk.
"""

from __future__ import annotations

import json
from typing import Any

from PIL import ExifTags, Image


def _jsonable(v: Any) -> Any:
    try:
        json.dumps(v)
        return v
    except (TypeError, ValueError):
        # bytes, IFDRational, etc.
        if isinstance(v, bytes):
            try:
                return v.decode("utf-8", errors="replace")[:500]
            except Exception:
                return f"<{len(v)} bytes>"
        return str(v)[:500]


def view_exif(input_path: str) -> dict[str, Any]:
    img = Image.open(input_path)
    info: dict[str, Any] = {
        "format": img.format,
        "mode": img.mode,
        "size": [img.width, img.height],
        "exif": {},
        "info": {},
        "gps": {},
    }
    try:
        exif = img.getexif()
    except Exception:
        exif = None

    if exif:
        for tag_id, value in exif.items():
            tag = ExifTags.TAGS.get(tag_id, f"Tag{tag_id}")
            info["exif"][tag] = _jsonable(value)

        # GPS sub-IFD
        try:
            gps_ifd = exif.get_ifd(0x8825)
        except Exception:
            gps_ifd = None
        if gps_ifd:
            for tag_id, value in gps_ifd.items():
                tag = ExifTags.GPSTAGS.get(tag_id, f"GPSTag{tag_id}")
                info["gps"][tag] = _jsonable(value)

    # Embedded text/info (e.g., PNG tEXt chunks)
    for k, v in (img.info or {}).items():
        info["info"][str(k)] = _jsonable(v)

    img.close()
    return info
