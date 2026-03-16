import pikepdf
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def make_booklet(input_path: str) -> str:
    """Rearrange pages for booklet printing (saddle-stitch).

    For a document of N pages, pages are ordered so that when printed
    double-sided and folded in half, they form a booklet.
    Page count is padded to a multiple of 4 with blank pages.
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"booklet_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(input_path) as pdf:
        n = len(pdf.pages)
        # Pad to multiple of 4
        while n % 4 != 0:
            blank = pikepdf.Page(pikepdf.Dictionary(
                Type=pikepdf.Name.Page,
                MediaBox=pdf.pages[0].MediaBox,
                Resources=pikepdf.Dictionary(),
            ))
            pdf.pages.append(blank)
            n += 1

        # Build booklet order
        order = []
        for i in range(n // 2):
            if i % 2 == 0:
                order.append(n - 1 - i)
                order.append(i)
            else:
                order.append(i)
                order.append(n - 1 - i)

        new_pdf = pikepdf.Pdf.new()
        for idx in order:
            new_pdf.pages.append(pdf.pages[idx])

        new_pdf.save(str(output_path))

    return str(output_path)
