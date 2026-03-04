import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def url_to_pdf(url: str) -> str:
    """Convert a URL to PDF using WeasyPrint (renders locally).
    
    WeasyPrint is imported lazily to avoid crashing the server
    if the system libraries aren't available.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"webpage_{uuid.uuid4().hex}.pdf")

    try:
        from weasyprint import HTML
        html = HTML(url=url)
        html.write_pdf(str(output_path))
    except ImportError:
        raise RuntimeError(
            "WeasyPrint is not available on this system. "
            "Install system dependencies: gobject, pango, cairo."
        )

    return str(output_path)
