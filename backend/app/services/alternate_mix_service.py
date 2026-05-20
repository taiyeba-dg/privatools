import pikepdf

from ..utils.cleanup import safe_open_pdf
from ..utils.filenames import temp_output


def alternate_mix(path1: str, path2: str, mode: str = "alternate") -> str:
    output_path = temp_output("alternate_mix", "pdf")

    with safe_open_pdf(path1) as pdf1, safe_open_pdf(path2) as pdf2:
        pages2 = list(pdf2.pages)
        if mode == "reverse-alternate":
            pages2 = list(reversed(pages2))

        with pikepdf.Pdf.new() as out:
            max_len = max(len(pdf1.pages), len(pages2))
            for i in range(max_len):
                if i < len(pdf1.pages):
                    out.pages.append(pdf1.pages[i])
                if i < len(pages2):
                    out.pages.append(pages2[i])
            out.save(str(output_path))

    return str(output_path)
