import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def whiteout_pdf(input_path: str, regions: list) -> str:
    """Cover regions of a PDF page with white boxes (eraser/white-out).
    
    Args:
        regions: List of dicts with keys: page (1-indexed), x, y, width, height
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"whiteout_{uuid.uuid4().hex}.pdf")

    doc = fitz.open(input_path)

    # Group regions by page
    by_page: dict[int, list] = {}
    for r in regions:
        pg = int(r.get("page", 1))
        by_page.setdefault(pg, []).append(r)

    for pg_num, rects in by_page.items():
        pg_idx = pg_num - 1
        if pg_idx < 0 or pg_idx >= len(doc):
            continue
        page = doc[pg_idx]
        shape = page.new_shape()
        for r in rects:
            rx = float(r.get("x", 0))
            ry = float(r.get("y", 0))
            rw = float(r.get("width", 50))
            rh = float(r.get("height", 20))
            rect = fitz.Rect(rx, ry, rx + rw, ry + rh)
            shape.draw_rect(rect)
        shape.finish(color=(1, 1, 1), fill=(1, 1, 1))
        shape.commit(overlay=True)

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()
    return str(output_path)
