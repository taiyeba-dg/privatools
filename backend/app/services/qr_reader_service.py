from PIL import Image
from pyzbar.pyzbar import decode


def read_qr(image_path: str) -> list[dict]:
    """Decode QR codes (and other barcodes) from an image.

    Args:
        image_path: Path to the image file.

    Returns:
        List of dicts with keys: data, type, rect.
    """
    img = Image.open(image_path)
    decoded = decode(img)

    results = []
    for obj in decoded:
        results.append({
            "data": obj.data.decode("utf-8", errors="replace"),
            "type": obj.type,
            "rect": {
                "left": obj.rect.left,
                "top": obj.rect.top,
                "width": obj.rect.width,
                "height": obj.rect.height,
            },
        })

    return results
