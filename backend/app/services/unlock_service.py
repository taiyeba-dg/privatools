import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def unlock_pdf(input_path: str, password: str) -> str:
    ensure_temp_dir()
    try:
        # First, try to open without a password to check if it's not encrypted
        with pikepdf.open(input_path) as pdf:
            output_path = get_temp_path(f"unlocked_{uuid.uuid4().hex}.pdf")
            pdf.save(str(output_path))
            return str(output_path)
    except pikepdf.PasswordError:
        # PDF is encrypted — try with provided password
        try:
            with pikepdf.open(input_path, password=password) as pdf:
                output_path = get_temp_path(f"unlocked_{uuid.uuid4().hex}.pdf")
                pdf.save(str(output_path))
                return str(output_path)
        except pikepdf.PasswordError:
            raise ValueError("Incorrect password. Please provide the correct password to unlock this PDF.")
