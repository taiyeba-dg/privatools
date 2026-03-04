import uuid
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def generate_favicon(input_path: str) -> str:
    """Generate a .ico favicon from any image.
    
    Creates a multi-size ICO file with 16x16, 32x32, and 48x48 icons.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"favicon_{uuid.uuid4().hex}.ico")

    img = Image.open(input_path)
    
    # Convert to RGBA for transparency support
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    # Create multiple sizes for the ICO file
    sizes = [(16, 16), (32, 32), (48, 48)]
    
    img.save(
        str(output_path),
        format="ICO",
        sizes=sizes,
    )

    return str(output_path)
