import uuid
from pdf2image import convert_from_path
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _detect_skew_angle(image: Image.Image) -> float:
    """Use row-sum variance projection to detect skew angle (-5 to +5 degrees)."""
    gray = image.convert("L").resize(
        (image.width // 2, image.height // 2), Image.Resampling.LANCZOS
    )
    # Invert so text is white on black
    inverted = gray.point(lambda p: 255 - p)

    best_angle = 0.0
    best_variance = -1.0

    for angle_tenth in range(-50, 51):
        angle = angle_tenth * 0.1
        rotated = inverted.rotate(angle, expand=False, fillcolor=0)
        width, height = rotated.size
        pixels = list(rotated.getdata())
        row_sums = []
        for row in range(height):
            row_sum = sum(pixels[row * width:(row + 1) * width])
            row_sums.append(row_sum)
        mean = sum(row_sums) / len(row_sums)
        variance = sum((s - mean) ** 2 for s in row_sums) / len(row_sums)
        if variance > best_variance:
            best_variance = variance
            best_angle = angle

    return best_angle


def deskew(input_path: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"deskewed_{uuid.uuid4().hex}.pdf")

    images = convert_from_path(input_path, dpi=150)
    deskewed = []

    for img in images:
        angle = _detect_skew_angle(img)
        if abs(angle) > 0.05:
            corrected = img.rotate(-angle, expand=True, fillcolor="white", resample=Image.Resampling.BICUBIC)
        else:
            corrected = img
        deskewed.append(corrected.convert("RGB"))

    if not deskewed:
        raise ValueError("No pages found in PDF")

    first = deskewed[0]
    rest = deskewed[1:]
    first.save(str(output_path), format="PDF", save_all=True, append_images=rest)

    return str(output_path)
