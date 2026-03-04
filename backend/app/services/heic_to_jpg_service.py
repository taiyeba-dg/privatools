import uuid
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def heic_to_jpg(input_path: str, quality: int = 90) -> str:
    """Convert HEIC/HEIF image to JPEG using Pillow.
    
    Pillow 10+ supports HEIF via pillow-heif plugin if installed.
    Falls back to direct open attempt.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"converted_{uuid.uuid4().hex}.jpg")

    try:
        # Try importing pillow-heif for HEIC support
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        pass  # Will try to open directly with Pillow

    img = Image.open(input_path)
    
    # Convert to RGB (HEIC may have alpha channel)
    if img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGB")
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img.save(str(output_path), "JPEG", quality=quality, optimize=True)

    return str(output_path)
