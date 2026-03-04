import uuid
import io
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def flatten_pdf(input_path: str) -> str:
    """Flatten PDF by rendering each page as an image and rebuilding."""
    ensure_temp_dir()
    output_path = get_temp_path(f"flattened_{uuid.uuid4().hex}.pdf")

    from pdf2image import convert_from_path
    from PIL import Image

    images = convert_from_path(input_path, dpi=150)
    if not images:
        raise ValueError("No pages found in PDF")

    first = images[0].convert("RGB")
    rest = [img.convert("RGB") for img in images[1:]]

    first.save(
        str(output_path),
        format="PDF",
        save_all=True,
        append_images=rest,
    )

    return str(output_path)
