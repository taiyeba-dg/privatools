import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def pdf_to_markdown(input_path: str) -> str:
    """Extract PDF content as Markdown format."""
    ensure_temp_dir()
    output_path = get_temp_path(f"markdown_{uuid.uuid4().hex}.md")

    doc = fitz.open(input_path)
    md_parts = []

    for i, page in enumerate(doc, 1):
        blocks = page.get_text("dict")["blocks"]
        page_lines = []

        for block in blocks:
            if block["type"] != 0:  # Skip image blocks
                continue
            for line in block["lines"]:
                text = ""
                is_bold = False
                is_large = False
                for span in line["spans"]:
                    t = span["text"].strip()
                    if not t:
                        continue
                    size = span["size"]
                    flags = span["flags"]
                    is_bold = bool(flags & 2**4)  # bold flag
                    is_large = size > 14

                    if is_bold:
                        text += f"**{t}** "
                    else:
                        text += t + " "

                text = text.strip()
                if not text:
                    continue

                # Detect headings by font size
                max_size = max(s["size"] for s in line["spans"])
                if max_size >= 20:
                    page_lines.append(f"# {text}")
                elif max_size >= 16:
                    page_lines.append(f"## {text}")
                elif max_size >= 13 and is_bold:
                    page_lines.append(f"### {text}")
                else:
                    page_lines.append(text)

        if page_lines:
            md_parts.append("\n\n".join(page_lines))

    doc.close()

    result = "\n\n---\n\n".join(md_parts)
    with open(str(output_path), "w", encoding="utf-8") as f:
        f.write(result)

    return str(output_path)
