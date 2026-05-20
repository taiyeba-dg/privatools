from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output


def reverse_pdf(input_path: str) -> str:
    output_path = temp_output("reversed", "pdf")
    with safe_open_pdf(input_path) as pdf:
        pdf.pages.reverse()
        pdf.save(str(output_path))
    return str(output_path)
