"""Split a PDF at every page containing a search term.

Each chunk runs from the first page (or the previous split point) up to
the page just BEFORE the next match. Returns a zip of the chunks named
part1.pdf, part2.pdf, …
"""

from __future__ import annotations

import re
import uuid
import zipfile

import fitz  # PyMuPDF
import pikepdf

from ..utils.cleanup import ensure_temp_dir, get_temp_path


def split_by_text(input_path: str, search: str, case_sensitive: bool = False) -> str:
    if not search or not search.strip():
        raise ValueError("search text cannot be empty")

    ensure_temp_dir()
    flags = 0 if case_sensitive else re.IGNORECASE
    pattern = re.compile(re.escape(search.strip()), flags)

    src = fitz.open(input_path)
    n = len(src)
    if n == 0:
        src.close()
        raise ValueError("PDF has no pages")

    # Find all page indices where the term appears.
    match_indices: list[int] = []
    for i in range(n):
        if pattern.search(src[i].get_text()):
            match_indices.append(i)
    src.close()

    if not match_indices:
        raise ValueError(f"Search term '{search}' not found in any page")

    # Build chunks: each chunk starts at a match (or page 0 for the first
    # chunk if the first match is not on page 0) and ends just before the
    # next match. Drop any leading pages that come before the first match —
    # they're not part of any chunk by definition of "split at the term".
    # Convention: include all pages, with the first chunk covering pages
    # 0..first_match-1 IF the user wants the pre-match prefix kept. We do
    # include it for completeness (label "part1" = before first match).
    boundaries: list[tuple[int, int]] = []
    cursor = 0
    for m in match_indices:
        if m > cursor:
            boundaries.append((cursor, m))
        cursor = m
    boundaries.append((cursor, n))

    pdf = pikepdf.open(input_path)
    chunk_paths: list = []
    try:
        for idx, (start, end) in enumerate(boundaries, start=1):
            chunk = pikepdf.Pdf.new()
            for p in range(start, end):
                chunk.pages.append(pdf.pages[p])
            chunk_out = get_temp_path(f"split_text_{uuid.uuid4().hex}_part{idx}.pdf")
            chunk.save(str(chunk_out))
            chunk_paths.append(chunk_out)
    finally:
        pdf.close()

    zip_path = get_temp_path(f"split_text_{uuid.uuid4().hex}.zip")
    with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_DEFLATED) as z:
        for i, p in enumerate(chunk_paths, start=1):
            z.write(str(p), arcname=f"part{i}.pdf")

    # Best-effort cleanup of intermediate chunk files
    for p in chunk_paths:
        try:
            p.unlink()
        except Exception:
            pass

    return str(zip_path)
