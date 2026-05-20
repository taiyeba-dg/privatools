import fitz  # PyMuPDF

from ..utils.colors import hex_to_rgb_float
from ..utils.filenames import temp_output


def annotate_pdf(input_path: str, annotations: list) -> str:
    """Add annotations (highlight, underline, strikethrough, note) to a PDF.

    Args:
        annotations: List of dicts with keys:
            - type: 'highlight', 'underline', 'strikethrough', 'note'
            - page: page number (1-indexed)
            - x, y, width, height: region coordinates
            - color: hex color (optional, default yellow for highlight)
            - text: note text (for 'note' type)
    """
    output_path = temp_output("annotated", "pdf")

    doc = fitz.open(input_path)
    try:
        for ann in annotations:
            ann_type = ann.get("type", "highlight")
            pg_num = int(ann.get("page", 1))
            pg_idx = pg_num - 1
            if pg_idx < 0 or pg_idx >= len(doc):
                continue

            page = doc[pg_idx]
            x = float(ann.get("x", 0))
            y = float(ann.get("y", 0))
            w = float(ann.get("width", 100))
            h = float(ann.get("height", 14))
            rect = fitz.Rect(x, y, x + w, y + h)

            # Default yellow for highlight if no/invalid color supplied.
            color = hex_to_rgb_float(ann.get("color", "#ffff00"), default=(1, 1, 0))

            if ann_type == "highlight":
                annot = page.add_highlight_annot(rect)
                annot.set_colors(stroke=color)
                annot.update()
            elif ann_type == "underline":
                annot = page.add_underline_annot(rect)
                annot.set_colors(stroke=color)
                annot.update()
            elif ann_type == "strikethrough":
                annot = page.add_strikeout_annot(rect)
                annot.set_colors(stroke=color)
                annot.update()
            elif ann_type == "note":
                text = ann.get("text", "Note")
                annot = page.add_text_annot(fitz.Point(x, y), text)
                annot.set_colors(stroke=color)
                annot.update()

        doc.save(str(output_path), garbage=4, deflate=True)
    finally:
        doc.close()
    return str(output_path)
