import uuid
import base64
import io
import fitz  # PyMuPDF
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir


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
    ensure_temp_dir()
    output_path = get_temp_path(f"signed_{uuid.uuid4().hex}.pdf")

    # Decode signature image
    # Handle data URI prefix if present
    if "," in signature_data:
        signature_data = signature_data.split(",", 1)[1]

    sig_bytes = base64.b64decode(signature_data)

    # Validate it's an image
    try:
        img = Image.open(io.BytesIO(sig_bytes))
        # Convert to PNG if not already
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        sig_bytes = buf.getvalue()
    except Exception:
        raise ValueError("Invalid signature image data")

    doc = fitz.open(input_path)

    pg_idx = page_number - 1
    if pg_idx < 0 or pg_idx >= len(doc):
        pg_idx = 0

    page = doc[pg_idx]

    # Convert y from top-origin to PDF bottom-origin
    rect = fitz.Rect(x, y, x + width, y + height)

    page.insert_image(rect, stream=sig_bytes)

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()

    return str(output_path)
