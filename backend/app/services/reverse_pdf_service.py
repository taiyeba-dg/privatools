import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir

def reverse_pdf(input_path: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"reversed_{uuid.uuid4().hex}.pdf")
    with pikepdf.open(input_path) as pdf:
        pdf.pages.reverse()
        pdf.save(str(output_path))
    return str(output_path)
