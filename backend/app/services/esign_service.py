import base64
import io

import fitz  # PyMuPDF
from PIL import Image, UnidentifiedImageError

from ..utils.exceptions import ValidationError
from ..utils.filenames import temp_output


def esign_pdf(input_path: str, signature_data: str,
              page_number: int = 1, x: float = 100, y: float = 100,
              width: float = 200, height: float = 80) -> str:
    """Place an e-signature image on a PDF page.

    Args:
        input_path: Path to input PDF
        signature_data: Base64-encoded signature image (PNG/JPEG)
        page_number: Page to sign (1-indexed)
        x: X position from left (in PDF points)
        y: Y position from top (in PDF points)
        width: Signature width
        height: Signature height
    """
    output_path = temp_output("signed", "pdf")

    # Decode signature image — handle data URI prefix if present.
    if "," in signature_data:
        signature_data = signature_data.split(",", 1)[1]

    try:
        sig_bytes = base64.b64decode(signature_data)
    except (ValueError, base64.binascii.Error) as exc:
        raise ValidationError("Invalid base64 signature data") from exc

    # Validate it's an image and normalise to PNG. `with` makes sure we
    # release the underlying file descriptor even on conversion failures.
    try:
        with Image.open(io.BytesIO(sig_bytes)) as img:
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            sig_bytes = buf.getvalue()
    except UnidentifiedImageError as exc:
        raise ValidationError("Signature isn't a recognised image format.") from exc
    except (OSError, ValueError) as exc:
        raise ValidationError(f"Signature image is invalid: {exc}") from exc

    doc = fitz.open(input_path)
    try:
        pg_idx = page_number - 1
        if pg_idx < 0 or pg_idx >= len(doc):
            pg_idx = 0

        page = doc[pg_idx]

        # Convert y from top-origin to PDF bottom-origin
        rect = fitz.Rect(x, y, x + width, y + height)

        page.insert_image(rect, stream=sig_bytes)

        doc.save(str(output_path), garbage=4, deflate=True)
    finally:
        doc.close()

    return str(output_path)
