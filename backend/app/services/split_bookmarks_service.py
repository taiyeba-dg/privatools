import uuid
import zipfile
import pikepdf
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _resolve_page_index(pdf: pikepdf.Pdf, destination) -> int:
    """Resolve a bookmark destination to a 0-based page index."""
    try:
        if destination is None:
            return 0
        if isinstance(destination, pikepdf.Array):
            page_ref = destination[0]
            for i, page in enumerate(pdf.pages):
                if page.objgen == page_ref.objgen:
                    return i
        if isinstance(destination, pikepdf.Page):
            return pdf.pages.index(destination)
    except Exception:
        pass
    return 0


def split_by_bookmarks(input_path: str) -> str:
    ensure_temp_dir()
    zip_path = get_temp_path(f"split_bookmarks_{uuid.uuid4().hex}.zip")

    with pikepdf.open(input_path) as pdf:
        total_pages = len(pdf.pages)
        bookmarks = []

        try:
            with pdf.open_outline() as outline:
                for item in outline.root:
                    try:
                        dest = item.destination
                        page_idx = _resolve_page_index(pdf, dest)
                        title = item.title or f"Section_{len(bookmarks)+1}"
                        bookmarks.append((title, page_idx))
                    except Exception:
                        continue
        except Exception:
            pass

        if not bookmarks:
            # No bookmarks: return full PDF as single chunk
            chunk_path = get_temp_path(f"chunk_{uuid.uuid4().hex}.pdf")
            with pikepdf.Pdf.new() as out:
                out.pages.extend(pdf.pages)
                out.save(str(chunk_path))
            with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_DEFLATED) as zf:
                zf.write(str(chunk_path), "full_document.pdf")
            return str(zip_path)

        # Sort by page index
        bookmarks.sort(key=lambda x: x[1])

        # Build page ranges
        ranges = []
        for i, (title, start) in enumerate(bookmarks):
            end = bookmarks[i + 1][1] if i + 1 < len(bookmarks) else total_pages
            ranges.append((title, start, end))

        with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_DEFLATED) as zf:
            for idx, (title, start, end) in enumerate(ranges, start=1):
                if start >= end:
                    continue
                chunk_path = get_temp_path(f"chunk_{uuid.uuid4().hex}.pdf")
                safe_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in title)[:50]
                with pikepdf.Pdf.new() as out:
                    out.pages.extend(pdf.pages[start:end])
                    out.save(str(chunk_path))
                zf.write(str(chunk_path), f"{idx:02d}_{safe_title}.pdf")

    return str(zip_path)
