import uuid
import math
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def make_collage(image_paths: list, columns: int = 3,
                 spacing: int = 10, bg_color: str = "#ffffff") -> str:
    """Create a photo collage from multiple images.
    
    Args:
        image_paths: List of image file paths
        columns: Number of columns in the grid
        spacing: Pixels between images
        bg_color: Background color hex
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"collage_{uuid.uuid4().hex}.jpg")

    if not image_paths:
        raise ValueError("No images provided")

    images = [Image.open(p).convert("RGB") for p in image_paths]
    
    # Calculate cell size (use the average dimensions)
    avg_w = sum(img.width for img in images) // len(images)
    avg_h = sum(img.height for img in images) // len(images)
    
    # Standardize cell size
    cell_w = min(avg_w, 600)
    cell_h = min(avg_h, 600)

    rows = math.ceil(len(images) / columns)

    canvas_w = columns * cell_w + (columns + 1) * spacing
    canvas_h = rows * cell_h + (rows + 1) * spacing

    # Parse background color
    bg = tuple(int(bg_color.lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
    canvas = Image.new("RGB", (canvas_w, canvas_h), bg)

    for idx, img in enumerate(images):
        row = idx // columns
        col = idx % columns

        # Resize to fit cell while maintaining aspect ratio
        img_ratio = img.width / img.height
        cell_ratio = cell_w / cell_h

        if img_ratio > cell_ratio:
            new_w = cell_w
            new_h = int(cell_w / img_ratio)
        else:
            new_h = cell_h
            new_w = int(cell_h * img_ratio)

        resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # Center in cell
        x = col * cell_w + (col + 1) * spacing + (cell_w - new_w) // 2
        y = row * cell_h + (row + 1) * spacing + (cell_h - new_h) // 2

        canvas.paste(resized, (x, y))

    canvas.save(str(output_path), "JPEG", quality=90)

    return str(output_path)
