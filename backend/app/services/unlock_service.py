import pikepdf

from ..utils.exceptions import PdfEncryptedError
from ..utils.filenames import temp_output


def unlock_pdf(input_path: str, password: str) -> str:
    """Unlock a PDF by removing its password encryption.

    Tries the password-less open first — many "protected" PDFs are
    only owner-locked and pikepdf can read them without a user password.
    Falls back to retrying with `password` if that fails.
    """
    output_path = temp_output("unlocked", "pdf")
    try:
        with pikepdf.open(input_path) as pdf:
            pdf.save(str(output_path))
            return str(output_path)
    except pikepdf.PasswordError:
        try:
            with pikepdf.open(input_path, password=password) as pdf:
                pdf.save(str(output_path))
                return str(output_path)
        except pikepdf.PasswordError as exc:
            raise PdfEncryptedError(
                "Incorrect password. Please provide the correct password to unlock this PDF."
            ) from exc
