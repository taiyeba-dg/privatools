"""Convert EPUB → PDF by extracting text from each XHTML entry.

EPUB is a ZIP wrapper around XHTML/CSS/images. The previous implementation
just iterated over `zf.namelist()` and called `zf.read(name)` for every
`.xhtml` entry — that's vulnerable to:

  * Zip slip — entry names containing "../../" let an attacker target
    paths outside the archive (we never write entries to disk, but
    relying on that for safety is fragile).
  * Decompression bombs — a 1 MB EPUB can expand to 10 GB of XHTML
    and exhaust the worker before we even reach the canvas code.

This rewrite enforces a per-entry decompressed cap and a total-extraction
cap, and skips entries whose names try to climb out of the archive.
"""

from __future__ import annotations

import html
import re
import zipfile

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from ..utils.exceptions import ValidationError
from ..utils.filenames import temp_output

# Caps. EPUBs over 200 MB extracted are extremely rare — even a long novel
# is < 50 MB of XHTML. These prevent a maliciously-compressed file from
# tying up the worker.
MAX_ENTRY_BYTES = 20 * 1024 * 1024       # 20 MB per chapter
MAX_TOTAL_BYTES = 200 * 1024 * 1024      # 200 MB total decompressed
MAX_ENTRIES = 2000                       # safety against many tiny entries

_HTML_TAG = re.compile(r"<[^>]+>")
_WHITESPACE = re.compile(r"\s+")


def _is_safe_entry_name(name: str) -> bool:
    """Reject zip-slip style names. We never write entries to disk, but
    refusing them keeps log noise down and protects future callers."""
    if name.startswith("/"):
        return False
    if ".." in name.replace("\\", "/").split("/"):
        return False
    return True


def _read_entry_safely(zf: zipfile.ZipFile, info: zipfile.ZipInfo) -> str | None:
    """Read a zip entry, refusing oversize files. Returns decoded text or None."""
    if info.file_size > MAX_ENTRY_BYTES:
        return None
    with zf.open(info, "r") as fh:
        data = fh.read(MAX_ENTRY_BYTES + 1)
    if len(data) > MAX_ENTRY_BYTES:
        return None
    try:
        return data.decode("utf-8", errors="replace")
    except (UnicodeDecodeError, LookupError):
        return None


def epub_to_pdf(input_path: str) -> str:
    """Convert an EPUB file at `input_path` to a flat PDF."""
    output_path = temp_output("epub", "pdf")

    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4
    margin = 72
    usable_width = width - 2 * margin
    y = height - margin
    font_size = 11
    line_height = 14

    c.setFont("Helvetica", font_size)

    try:
        zf = zipfile.ZipFile(input_path, "r")
    except zipfile.BadZipFile as exc:
        raise ValidationError("File is not a valid EPUB archive.") from exc

    with zf:
        infos = zf.infolist()
        if len(infos) > MAX_ENTRIES:
            raise ValidationError(
                f"EPUB contains too many entries (>{MAX_ENTRIES}); refusing to process."
            )

        # Filter to XHTML/HTML chapters, skip TOC, and sort for stable order.
        chapters: list[zipfile.ZipInfo] = []
        for info in infos:
            name = info.filename
            if not _is_safe_entry_name(name):
                continue
            lname = name.lower()
            if not lname.endswith((".xhtml", ".html", ".htm")):
                continue
            if "toc" in lname:
                continue
            chapters.append(info)
        chapters.sort(key=lambda i: i.filename)

        total_decompressed = 0
        for info in chapters:
            raw = _read_entry_safely(zf, info)
            if raw is None:
                continue
            total_decompressed += len(raw)
            if total_decompressed > MAX_TOTAL_BYTES:
                raise ValidationError(
                    "EPUB content exceeds the decompression cap — refusing to process."
                )

            text = _HTML_TAG.sub(" ", raw)
            text = html.unescape(text)
            text = _WHITESPACE.sub(" ", text).strip()

            if not text:
                continue

            words = text.split()
            line = ""
            for word in words:
                test = f"{line} {word}".strip()
                if c.stringWidth(test, "Helvetica", font_size) < usable_width:
                    line = test
                else:
                    if y < margin:
                        c.showPage()
                        c.setFont("Helvetica", font_size)
                        y = height - margin
                    c.drawString(margin, y, line)
                    y -= line_height
                    line = word

            if line:
                if y < margin:
                    c.showPage()
                    c.setFont("Helvetica", font_size)
                    y = height - margin
                c.drawString(margin, y, line)
                y -= line_height

            # Paragraph break between chapters
            y -= line_height * 0.5

    c.save()
    return str(output_path)
