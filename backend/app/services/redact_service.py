import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color string to (r, g, b) tuple (0-1 range)."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) != 6:
        return (0, 0, 0)
    try:
        r = int(hex_color[0:2], 16) / 255
        g = int(hex_color[2:4], 16) / 255
        b = int(hex_color[4:6], 16) / 255
        return (r, g, b)
    except ValueError:
        return (0, 0, 0)


def redact_pdf(input_path: str, redactions: list, color: str = "#000000") -> str:
    """Redact PDF using PyMuPDF's native redact annotations.

    Uses fitz.Page.add_redact_annot() + apply_redactions() for fast,
    permanent, quality-preserving redaction — no re-rendering needed.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"redacted_{uuid.uuid4().hex}.pdf")

    fill_color = _hex_to_rgb(color)

    doc = fitz.open(input_path)
    page_count = len(doc)

    # Group redactions by page (0-indexed internally)
    by_page: dict[int, list] = {}
    for r in redactions:
        pg = int(r.get("page", 0))
        by_page.setdefault(pg, []).append(r)

    for pg_idx, rects in by_page.items():
        if pg_idx < 0 or pg_idx >= page_count:
            continue
        page = doc[pg_idx]

        for r in rects:
            # Support both x0/y0/x1/y1 and x/y/width/height formats
            if "x0" in r:
                rect = fitz.Rect(
                    float(r.get("x0", 0)),
                    float(r.get("y0", 0)),
                    float(r.get("x1", 10)),
                    float(r.get("y1", 10)),
                )
            else:
                x = float(r.get("x", 0))
                y = float(r.get("y", 0))
                w = float(r.get("width", 10))
                h = float(r.get("height", 10))
                rect = fitz.Rect(x, y, x + w, y + h)

            page.add_redact_annot(rect, fill=fill_color)

        # Apply redactions — permanently removes content under the rects
        page.apply_redactions()

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()

    return str(output_path)
