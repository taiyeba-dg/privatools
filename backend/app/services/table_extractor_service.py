import csv

import fitz  # PyMuPDF

from ..utils.exceptions import ValidationError
from ..utils.filenames import temp_output
from ..utils.page_range import parse_page_range


def extract_tables(input_path: str, pages: str = "all") -> str:
    """Extract tables from PDF pages and save as CSV.

    Uses PyMuPDF's built-in table detection to find and extract
    tabular data from PDF pages.

    Args:
        input_path: Path to input PDF.
        pages: 'all' or a Smallpdf-style page range ('1-3,5,7-end').

    Returns:
        Path to output CSV file.
    """
    output_path = temp_output("tables", "csv")

    doc = fitz.open(input_path)
    try:
        total = len(doc)
        try:
            page_indices = parse_page_range(pages or "all", total, allow_empty=True)
        except ValueError:
            # Stay forgiving: invalid input previously fell through to "all".
            page_indices = list(range(total))
        if not page_indices:
            page_indices = list(range(total))

        all_rows: list[list[str]] = []
        for pg_idx in page_indices:
            page = doc[pg_idx]

            try:
                tabs = page.find_tables()
                for table in tabs:
                    for row in table.extract():
                        cleaned = [str(cell).strip() if cell else "" for cell in row]
                        if any(cleaned):  # skip fully blank rows
                            all_rows.append(cleaned)
                    if all_rows and all_rows[-1]:
                        all_rows.append([])
            except AttributeError:
                # Older PyMuPDF — fall back to whitespace-split heuristic.
                text = page.get_text("text")
                for line in text.split("\n"):
                    line = line.strip()
                    if line:
                        cells = [c.strip() for c in line.split("  ") if c.strip()]
                        if len(cells) > 1:
                            all_rows.append(cells)
    finally:
        doc.close()

    if not all_rows:
        raise ValidationError("No tables found in the PDF")

    with open(str(output_path), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for row in all_rows:
            writer.writerow(row)

    return str(output_path)
