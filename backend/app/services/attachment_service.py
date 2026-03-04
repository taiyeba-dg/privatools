import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def add_attachment(input_path: str, attachment_path: str, attachment_name: str) -> str:
    """Embed a file as an attachment inside a PDF."""
    ensure_temp_dir()
    output_path = get_temp_path(f"attached_{uuid.uuid4().hex}.pdf")

    doc = fitz.open(input_path)

    with open(attachment_path, "rb") as f:
        data = f.read()

    doc.embfile_add(attachment_name, data, filename=attachment_name)

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()
    return str(output_path)
