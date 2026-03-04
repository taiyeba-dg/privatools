import uuid
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def remove_background(input_path: str) -> str:
    """Remove image background using rembg (runs locally, no API).
    
    Uses the u2net model which runs entirely on-device for privacy.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"nobg_{uuid.uuid4().hex}.png")

    from rembg import remove

    with open(input_path, "rb") as f:
        input_data = f.read()

    output_data = remove(input_data)

    with open(str(output_path), "wb") as f:
        f.write(output_data)

    return str(output_path)
