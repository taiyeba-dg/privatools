from PIL import Image, ImageDraw, ImageFont

from ..utils.filenames import temp_output
from ..utils.images import open_image_safe


def add_watermark(input_path: str, text: str = "WATERMARK",
                  opacity: int = 80, position: str = "center",
                  font_size: int = 40) -> str:
    """Add text watermark to an image."""
    output_path = temp_output("watermarked", "png")

    # Load into memory and close the source file handle right away so a
    # follow-up `img.save()` on the same path (rare but possible from the
    # bulk watermark route) doesn't trip "file in use" on Windows.
    with open_image_safe(input_path) as _src:
        img = _src.convert("RGBA")

    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Try to use a nice font, fallback to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except (IOError, OSError):
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except (IOError, OSError):
            font = ImageFont.load_default()

    # Calculate text position
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    w, h = img.size

    if position == "tile":
        # Tile watermark across entire image
        for y in range(0, h, th + 60):
            for x in range(0, w, tw + 60):
                draw.text((x, y), text, fill=(128, 128, 128, opacity), font=font)
    elif position == "top-left":
        draw.text((20, 20), text, fill=(128, 128, 128, opacity), font=font)
    elif position == "top-right":
        draw.text((w - tw - 20, 20), text, fill=(128, 128, 128, opacity), font=font)
    elif position == "bottom-left":
        draw.text((20, h - th - 20), text, fill=(128, 128, 128, opacity), font=font)
    elif position == "bottom-right":
        draw.text((w - tw - 20, h - th - 20), text, fill=(128, 128, 128, opacity), font=font)
    else:  # center
        draw.text(((w - tw) // 2, (h - th) // 2), text, fill=(128, 128, 128, opacity), font=font)

    result = Image.alpha_composite(img, overlay)
    result = result.convert("RGB")
    result.save(str(output_path), "PNG")

    return str(output_path)
