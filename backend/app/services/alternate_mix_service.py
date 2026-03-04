import uuid
import pikepdf
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def alternate_mix(path1: str, path2: str, mode: str = "alternate") -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"alternate_mix_{uuid.uuid4().hex}.pdf")

    with pikepdf.open(path1) as pdf1, pikepdf.open(path2) as pdf2:
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
