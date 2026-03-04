import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


# Available stamp presets
STAMP_PRESETS = {
    "confidential": {"text": "CONFIDENTIAL", "color": (1, 0, 0)},
    "draft": {"text": "DRAFT", "color": (0.5, 0.5, 0.5)},
    "approved": {"text": "APPROVED", "color": (0, 0.6, 0)},
    "final": {"text": "FINAL", "color": (0, 0, 0.8)},
    "copy": {"text": "COPY", "color": (0.6, 0, 0.6)},
    "void": {"text": "VOID", "color": (1, 0, 0)},
    "sample": {"text": "SAMPLE", "color": (0, 0.5, 0.5)},
    "not_approved": {"text": "NOT APPROVED", "color": (1, 0, 0)},
}


def stamp_pdf(input_path: str, stamp_type: str = "confidential",
              custom_text: str = None, opacity: float = 0.3,
              position: str = "center", pages: str = "all") -> str:
    """Add a stamp to PDF pages using PyMuPDF."""
    ensure_temp_dir()
    output_path = get_temp_path(f"stamped_{uuid.uuid4().hex}.pdf")

    # Get stamp config
    if stamp_type == "custom" and custom_text:
        text = custom_text.upper()
        color = (1, 0, 0)
    elif stamp_type in STAMP_PRESETS:
        preset = STAMP_PRESETS[stamp_type]
        text = preset["text"]
        color = preset["color"]
    else:
        text = "CONFIDENTIAL"
        color = (1, 0, 0)

    # Apply opacity by blending color toward white
    r = color[0] + (1 - color[0]) * (1 - opacity)
    g = color[1] + (1 - color[1]) * (1 - opacity)
    b = color[2] + (1 - color[2]) * (1 - opacity)
    faded_color = (r, g, b)

    doc = fitz.open(input_path)

    # Parse page selection
    if pages == "all":
        page_indices = range(len(doc))
    else:
        try:
            page_indices = [int(p.strip()) - 1 for p in pages.split(",")]
            page_indices = [p for p in page_indices if 0 <= p < len(doc)]
        except ValueError:
            page_indices = range(len(doc))

    for pg_idx in page_indices:
        page = doc[pg_idx]
        rect = page.rect
        cx, cy = rect.width / 2, rect.height / 2

        # Font size based on page width and text length
        font_size = min(rect.width / (len(text) * 0.55), 72)

        tw = fitz.get_text_length(text, fontname="helv", fontsize=font_size)

        if position == "diagonal":
            # PyMuPDF only supports 0/90/180/270 — use center for diagonal
            text_point = fitz.Point(cx - tw / 2, cy + font_size / 3)
            rotate = 0
        elif position == "top":
            text_point = fitz.Point(cx - tw / 2, rect.height * 0.12)
            rotate = 0
        elif position == "bottom":
            text_point = fitz.Point(cx - tw / 2, rect.height * 0.92)
            rotate = 0
        else:  # center
            text_point = fitz.Point(cx - tw / 2, cy + font_size / 3)
            rotate = 0

        page.insert_text(
            text_point,
            text,
            fontsize=font_size,
            fontname="helv",
            color=faded_color,
            rotate=rotate,
            overlay=True,
        )

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()

    return str(output_path)
