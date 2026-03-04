from pypdf import PdfReader


def extract_text(input_path: str) -> dict:
    reader = PdfReader(input_path)
    pages = []
    full_text_parts = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append({"page": i + 1, "text": text})
        full_text_parts.append(text)

    return {"text": "\n\n".join(full_text_parts), "pages": pages}
