from PIL import Image

from ..utils.exceptions import ValidationError
from ..utils.filenames import temp_output


def merge_images(image_paths: list, direction: str = "horizontal") -> str:
    """Merge multiple images side-by-side or top-to-bottom.

    Args:
        image_paths: List of image file paths
        direction: 'horizontal' or 'vertical'

    Returns:
        Path to the merged PNG file.
    """
    output_path = temp_output("merged", "png")

    if not image_paths:
        raise ValidationError("No images provided")

    # Load + convert each image, closing the source handle right after so
    # we don't hold N file descriptors open while resizing.
    images: list[Image.Image] = []
    for p in image_paths:
        with Image.open(p) as src:
            images.append(src.convert("RGBA"))

    if direction == "horizontal":
        # Match heights to the tallest image; scale widths proportionally
        max_h = max(img.height for img in images)
        resized = []
        for img in images:
            if img.height != max_h:
                ratio = max_h / img.height
                new_w = int(img.width * ratio)
                img = img.resize((new_w, max_h), Image.Resampling.LANCZOS)
            resized.append(img)

        total_w = sum(img.width for img in resized)
        canvas = Image.new("RGBA", (total_w, max_h), (255, 255, 255, 0))

        x_offset = 0
        for img in resized:
            canvas.paste(img, (x_offset, 0))
            x_offset += img.width
    else:
        # Vertical: match widths to the widest image; scale heights proportionally
        max_w = max(img.width for img in images)
        resized = []
        for img in images:
            if img.width != max_w:
                ratio = max_w / img.width
                new_h = int(img.height * ratio)
                img = img.resize((max_w, new_h), Image.Resampling.LANCZOS)
            resized.append(img)

        total_h = sum(img.height for img in resized)
        canvas = Image.new("RGBA", (max_w, total_h), (255, 255, 255, 0))

        y_offset = 0
        for img in resized:
            canvas.paste(img, (0, y_offset))
            y_offset += img.height

    # Save as PNG to preserve transparency
    canvas.save(str(output_path), "PNG")

    return str(output_path)
