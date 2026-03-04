import uuid
import io
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def svg_to_png(input_path: str, scale: float = 2.0) -> str:
    """Convert SVG to PNG. Tries cairosvg first, then reportlab/PIL fallback."""
    ensure_temp_dir()
    output_path = get_temp_path(f"svg_{uuid.uuid4().hex}.png")

    # Read the SVG file
    with open(input_path, "rb") as f:
        svg_data = f.read()

    # Try cairosvg (best quality)
    try:
        import cairosvg
        cairosvg.svg2png(
            bytestring=svg_data,
            write_to=str(output_path),
            scale=scale,
        )
        return str(output_path)
    except (ImportError, OSError):
        pass

    # Fallback: use PyMuPDF (supports SVG in recent versions)
    try:
        import fitz
        # Open SVG as a document
        doc = fitz.open(stream=svg_data, filetype="svg")
        if len(doc) > 0:
            page = doc[0]
            mat = fitz.Matrix(scale * 2, scale * 2)  # Higher scale for quality
            pix = page.get_pixmap(matrix=mat, alpha=True)
            pix.save(str(output_path))
            doc.close()
            return str(output_path)
        doc.close()
    except Exception:
        pass

    raise RuntimeError("SVG conversion failed — install cairosvg system dependencies")
