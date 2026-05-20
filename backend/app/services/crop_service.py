from decimal import Decimal

import pikepdf

from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output


def crop_pdf(
    input_path: str,
    top: float = 0.0,
    bottom: float = 0.0,
    left: float = 0.0,
    right: float = 0.0,
) -> str:
    output_path = temp_output("cropped", "pdf")

    with safe_open_pdf(input_path) as pdf:
        for page in pdf.pages:
            mediabox = page.mediabox
            x0 = float(mediabox[0])
            y0 = float(mediabox[1])
            x1 = float(mediabox[2])
            y1 = float(mediabox[3])

            new_x0 = x0 + left
            new_y0 = y0 + bottom
            new_x1 = x1 - right
            new_y1 = y1 - top

            page["/CropBox"] = pikepdf.Array([
                Decimal(str(new_x0)),
                Decimal(str(new_y0)),
                Decimal(str(new_x1)),
                Decimal(str(new_y1)),
            ])

        pdf.save(str(output_path))

    return str(output_path)
