import uuid
import io
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from ..utils.cleanup import get_temp_path, ensure_temp_dir


# barcode types supported
BARCODE_TYPES = {
    "code128": "code128",
    "code39": "code39",
    "ean13": "ean13",
    "ean8": "ean8",
    "upca": "upca",
    "isbn13": "isbn13",
    "qr": "qr",
}


def generate_barcode(data: str, barcode_type: str = "code128",
                     output_format: str = "png") -> str:
    """Generate a barcode image from data.
    
    Uses python-barcode for linear barcodes, qrcode for QR codes.
    """
    ensure_temp_dir()

    if barcode_type == "qr":
        import qrcode
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        out = get_temp_path(f"barcode_{uuid.uuid4().hex}.png")
        img.save(str(out))
        return str(out)

    try:
        import barcode
        from barcode.writer import ImageWriter

        bc_class = barcode.get_barcode_class(barcode_type)
        bc = bc_class(data, writer=ImageWriter())
        out = get_temp_path(f"barcode_{uuid.uuid4().hex}")
        filename = bc.save(str(out))  # Returns path with extension
        return filename
    except Exception as e:
        # Fallback: generate a simple text-based barcode using PIL
        img = Image.new("RGB", (400, 150), "white")
        from PIL import ImageDraw, ImageFont
        d = ImageDraw.Draw(img)
        d.text((20, 60), f"[{barcode_type.upper()}] {data}", fill="black")
        out = get_temp_path(f"barcode_{uuid.uuid4().hex}.png")
        img.save(str(out))
        return str(out)
