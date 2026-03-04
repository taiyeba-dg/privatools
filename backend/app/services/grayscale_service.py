import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def convert_to_grayscale(input_path: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"grayscale_{uuid.uuid4().hex}.pdf")

    from pdf2image import convert_from_path
    from PIL import Image

    images = convert_from_path(input_path, dpi=150)
    if not images:
        raise ValueError("No pages found in PDF")

    gray_images = [img.convert("L").convert("RGB") for img in images]

    gray_images[0].save(
        str(output_path),
        format="PDF",
        save_all=True,
        append_images=gray_images[1:],
    )

    return str(output_path)
