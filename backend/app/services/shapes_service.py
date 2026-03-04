import uuid
import math
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def add_shapes(input_path: str, shapes: list) -> str:
    """Add shapes (rectangle, circle, line, arrow) to PDF pages.
    
    Args:
        shapes: List of dicts with keys:
            - type: 'rectangle', 'circle', 'line', 'arrow'
            - page: page number (1-indexed)
            - x, y: start coordinates
            - width, height: dimensions (for rect/circle)
            - x2, y2: end coordinates (for line/arrow)
            - color: hex color string
            - fill: hex fill color (optional, for rect/circle)
            - stroke_width: line thickness
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"shapes_{uuid.uuid4().hex}.pdf")

    doc = fitz.open(input_path)

    for s in shapes:
        shape_type = s.get("type", "rectangle")
        pg_num = int(s.get("page", 1))
        pg_idx = pg_num - 1
        if pg_idx < 0 or pg_idx >= len(doc):
            continue

        page = doc[pg_idx]
        shape = page.new_shape()

        # Parse colors
        def hex_to_rgb(h, default=(0, 0, 0)):
            try:
                return (int(h[1:3], 16)/255, int(h[3:5], 16)/255, int(h[5:7], 16)/255)
            except (ValueError, IndexError, TypeError):
                return default

        color = hex_to_rgb(s.get("color", "#000000"))
        fill_color = hex_to_rgb(s.get("fill", ""), None) if s.get("fill") else None
        stroke_w = float(s.get("stroke_width", 2))

        x = float(s.get("x", 0))
        y = float(s.get("y", 0))

        if shape_type == "rectangle":
            w = float(s.get("width", 100))
            h = float(s.get("height", 50))
            rect = fitz.Rect(x, y, x + w, y + h)
            shape.draw_rect(rect)

        elif shape_type == "circle":
            w = float(s.get("width", 60))
            h = float(s.get("height", 60))
            center = fitz.Point(x + w/2, y + h/2)
            shape.draw_circle(center, min(w, h) / 2)

        elif shape_type in ("line", "arrow"):
            x2 = float(s.get("x2", x + 100))
            y2 = float(s.get("y2", y))
            shape.draw_line(fitz.Point(x, y), fitz.Point(x2, y2))

            if shape_type == "arrow":
                # Draw arrowhead
                angle = math.atan2(y2 - y, x2 - x)
                arrow_len = 12
                a1 = angle + math.radians(150)
                a2 = angle - math.radians(150)
                shape.draw_line(fitz.Point(x2, y2), fitz.Point(x2 + arrow_len * math.cos(a1), y2 + arrow_len * math.sin(a1)))
                shape.draw_line(fitz.Point(x2, y2), fitz.Point(x2 + arrow_len * math.cos(a2), y2 + arrow_len * math.sin(a2)))

        shape.finish(color=color, fill=fill_color, width=stroke_w)
        shape.commit(overlay=True)

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()
    return str(output_path)
