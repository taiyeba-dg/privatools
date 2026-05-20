from PIL import Image

from ..utils.filenames import temp_output


def heic_to_jpg(input_path: str, quality: int = 90) -> str:
    """Convert HEIC/HEIF image to JPEG using Pillow.

    Pillow 10+ supports HEIF via the pillow-heif plugin if installed.
    Falls back to direct open attempt; if the system doesn't have HEIF
    decoding the open call raises and the caller's exception handler
    surfaces a clean 400.
    """
    output_path = temp_output("converted", "jpg")

    try:
        # Try importing pillow-heif for HEIC support
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        pass  # Will try to open directly with Pillow

    with Image.open(input_path) as img:
        # Convert to RGB (HEIC may have alpha channel)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(str(output_path), "JPEG", quality=quality, optimize=True)

    return str(output_path)
