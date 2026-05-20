from decimal import Decimal

import pikepdf

from ..utils.cleanup import safe_open_pdf
from ..utils.exceptions import ValidationError
from ..utils.filenames import temp_output

# Standard page sizes in points (width x height)
PAGE_SIZES = {
    "a4": (595.28, 841.89),
    "letter": (612.0, 792.0),
    "a3": (841.89, 1190.55),
    "legal": (612.0, 1008.0),
}


def resize_pdf(
    input_path: str,
    page_size: str = "a4",
    width: float | None = None,
    height: float | None = None,
) -> str:
    output_path = temp_output("resized", "pdf")

    if page_size == "custom":
        if width is None or height is None:
            raise ValidationError("Custom page size requires both width and height")
        target_w, target_h = float(width), float(height)
    else:
        key = page_size.lower()
        if key not in PAGE_SIZES:
            raise ValidationError(f"Unknown page size: {page_size}")
        target_w, target_h = PAGE_SIZES[key]

    with safe_open_pdf(input_path) as pdf:
        for page in pdf.pages:
            page["/MediaBox"] = pikepdf.Array([
                Decimal("0"),
                Decimal("0"),
                Decimal(str(round(target_w, 2))),
                Decimal(str(round(target_h, 2))),
            ])
            # Remove CropBox so it doesn't override MediaBox
            if "/CropBox" in page:
                del page["/CropBox"]

        pdf.save(str(output_path))

    return str(output_path)
