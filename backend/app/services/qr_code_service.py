import io
import uuid
import pikepdf
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _make_qr_drawing(data: str, size: float) -> Drawing:
    qr = QrCodeWidget(data)
    bounds = qr.getBounds()
    qr_width = bounds[2] - bounds[0]
    qr_height = bounds[3] - bounds[1]
    d = Drawing(size, size, transform=[size / qr_width, 0, 0, size / qr_height, 0, 0])
    d.add(qr)
    return d


def _qr_to_pdf_bytes(data: str, size: float) -> bytes:
    """Render QR code to a single-page PDF and return as bytes."""
    d = _make_qr_drawing(data, size)
    buf = io.BytesIO()
    renderPDF.drawToFile(d, buf)
    buf.seek(0)
    return buf.read()


def generate_qr_png(data: str, size: int = 300) -> str:
    """Generate a QR code PNG by first rendering to PDF then converting via pdf2image."""
    from pdf2image import convert_from_bytes

    ensure_temp_dir()
    output_path = get_temp_path(f"qr_{uuid.uuid4().hex}.png")
    pdf_bytes = _qr_to_pdf_bytes(data, float(size))
    images = convert_from_bytes(pdf_bytes, dpi=150)
    if not images:
        raise RuntimeError("Failed to convert QR PDF to image")
    images[0].save(str(output_path), "PNG")
    return str(output_path)


def generate_qr_pdf(data: str, size: int = 300) -> str:
    """Generate a QR code as a standalone PDF."""
    ensure_temp_dir()
    output_path = get_temp_path(f"qr_{uuid.uuid4().hex}.pdf")
    pdf_bytes = _qr_to_pdf_bytes(data, float(size))
    output_path.write_bytes(pdf_bytes)
    return str(output_path)


def embed_qr_in_pdf(
    input_path: str,
    data: str,
    page: int = 1,
    x: float = 50,
    y: float = 50,
    qr_size: float = 100,
) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"qr_embedded_{uuid.uuid4().hex}.pdf")

    # Generate QR as PNG first
    qr_png_path = generate_qr_png(data, size=int(qr_size))

    with pikepdf.open(input_path) as pdf:
        page_count = len(pdf.pages)
        pg_idx = max(0, min(page - 1, page_count - 1))
        target_page = pdf.pages[pg_idx]

        mediabox = target_page.mediabox
        pg_width = float(mediabox[2]) - float(mediabox[0])
        pg_height = float(mediabox[3]) - float(mediabox[1])

        packet = io.BytesIO()
        c = canvas.Canvas(packet, pagesize=(pg_width, pg_height))
        c.drawImage(ImageReader(qr_png_path), x, y, width=qr_size, height=qr_size, mask="auto")
        c.save()
        packet.seek(0)

        overlay_pdf = pikepdf.Pdf.open(packet)
        pikepdf.Page(target_page).add_overlay(overlay_pdf.pages[0])

        pdf.save(str(output_path))

    return str(output_path)

