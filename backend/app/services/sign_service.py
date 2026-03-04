import base64
import io
import uuid
import pikepdf
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def sign_pdf(
    input_path: str,
    signature_path: str,
    page: int = 1,
    x: float = 50,
    y: float = 50,
    width: float = 200,
    height: float = 80,
) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"signed_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        page_count = len(pdf.pages)
        page_idx = max(0, min(page - 1, page_count - 1))
        target_page = pdf.pages[page_idx]

        mediabox = target_page.mediabox
        pg_width = float(mediabox[2]) - float(mediabox[0])
        pg_height = float(mediabox[3]) - float(mediabox[1])

        packet = io.BytesIO()
        c = canvas.Canvas(packet, pagesize=(pg_width, pg_height))
        c.drawImage(ImageReader(signature_path), x, y, width=width, height=height, mask="auto")
        c.save()
        packet.seek(0)

        overlay_pdf = pikepdf.Pdf.open(packet)
        overlay_page = overlay_pdf.pages[0]
        pikepdf.Page(target_page).add_overlay(overlay_page)

        pdf.save(str(output_path))

    return str(output_path)


def decode_base64_signature(data_url: str) -> str:
    """Decode a base64 data URL and save as a temporary PNG file."""
    ensure_temp_dir()
    if data_url.startswith("data:"):
        header, encoded = data_url.split(",", 1)
    else:
        encoded = data_url
    image_bytes = base64.b64decode(encoded)
    sig_path = get_temp_path(f"sig_{uuid.uuid4().hex}.png")
    sig_path.write_bytes(image_bytes)
    return str(sig_path)
