"""
Dynamic OG image generator.
Returns a 1200x630 PNG with the page title overlaid on PrivaTools branding.
"""
from __future__ import annotations
import io
import textwrap
from pathlib import Path
from fastapi import APIRouter, Query
from fastapi.responses import Response
from PIL import Image, ImageDraw, ImageFont

from ..seo_meta import get_meta_for_path

router = APIRouter()

_FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
_FONT_REG  = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

_BG       = (15, 23, 42)       # #0f172a  dark navy
_ACCENT   = (99, 102, 241)     # #6366f1  indigo
_WHITE    = (255, 255, 255)
_MUTED    = (148, 163, 184)    # slate-400

W, H = 1200, 630


def _make_og_image(title: str, subtitle: str = "") -> bytes:
    img = Image.new("RGB", (W, H), _BG)
    draw = ImageDraw.Draw(img)

    # Top accent bar
    draw.rectangle([(0, 0), (W, 6)], fill=_ACCENT)

    # Load fonts
    try:
        font_title  = ImageFont.truetype(_FONT_BOLD, 56)
        font_sub    = ImageFont.truetype(_FONT_REG,  28)
        font_brand  = ImageFont.truetype(_FONT_BOLD, 24)
        font_domain = ImageFont.truetype(_FONT_REG,  22)
    except OSError:
        font_title = font_sub = font_brand = font_domain = ImageFont.load_default()

    # Brand tag (top-left)
    draw.text((60, 40), "PRIVATOOLS", font=font_brand, fill=_ACCENT)

    # Title — word-wrap at ~28 chars per line, max 3 lines
    lines = textwrap.wrap(title, width=30)[:3]
    y = 160
    for line in lines:
        draw.text((60, y), line, font=font_title, fill=_WHITE)
        y += 72

    # Subtitle / description
    if subtitle:
        sub_lines = textwrap.wrap(subtitle, width=55)[:2]
        y += 20
        for line in sub_lines:
            draw.text((60, y), line, font=font_sub, fill=_MUTED)
            y += 40

    # Bottom bar
    draw.rectangle([(0, H - 70), (W, H)], fill=(30, 41, 59))  # slate-800
    draw.text((60, H - 48), "privatools.me", font=font_domain, fill=_MUTED)
    draw.text((W - 320, H - 48), "Free · Open Source · Privacy-First", font=font_domain, fill=_ACCENT)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


@router.get("/api/og-image")
async def og_image(p: str = Query(default="/", alias="p")):
    title, description = get_meta_for_path(p)
    # Strip the " | PrivaTools" suffix for cleaner image title
    display_title = title.replace(" | PrivaTools", "").replace(" — PrivaTools", "")
    # Use first sentence of description as subtitle
    subtitle = description.split(".")[0] + "." if description else ""
    if len(subtitle) > 100:
        subtitle = subtitle[:97] + "…"
    png = _make_og_image(display_title, subtitle)
    return Response(content=png, media_type="image/png", headers={
        "Cache-Control": "public, max-age=86400",
    })
