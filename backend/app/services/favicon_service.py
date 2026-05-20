from ..utils.filenames import temp_output
from ..utils.images import open_image_safe


def generate_favicon(input_path: str) -> str:
    """Generate a .ico favicon from any image.

    Creates a multi-size ICO file with 16x16, 32x32, and 48x48 icons.
    """
    output_path = temp_output("favicon", "ico")

    with open_image_safe(input_path, convert="RGBA") as img:
        # Multi-size ICO — pillow will downsample for each size.
        img.save(
            str(output_path),
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48)],
        )

    return str(output_path)
