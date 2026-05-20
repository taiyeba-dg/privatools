import fitz  # PyMuPDF

from ..utils.filenames import temp_output


def pdf_to_markdown(input_path: str) -> str:
    """Extract PDF content as Markdown format."""
    output_path = temp_output("markdown", "md")

    doc = fitz.open(input_path)
    try:
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
                    for span in line["spans"]:
                        t = span["text"].strip()
                        if not t:
                            continue
                        flags = span["flags"]
                        is_bold = bool(flags & 2**4)  # bold flag

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
    finally:
        doc.close()

    result = "\n\n---\n\n".join(md_parts)
    with open(str(output_path), "w", encoding="utf-8") as f:
        f.write(result)

    return str(output_path)
