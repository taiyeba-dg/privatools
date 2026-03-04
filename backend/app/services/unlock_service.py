import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def unlock_pdf(input_path: str, password: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"unlocked_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path, password=password) as pdf:
        pdf.save(str(output_path))
    return str(output_path)
