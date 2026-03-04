import uuid
import csv
import io
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def extract_tables(input_path: str, pages: str = "all") -> str:
    """Extract tables from PDF pages and save as CSV.
    
    Uses PyMuPDF's built-in table detection to find and extract
    tabular data from PDF pages.
    
    Args:
        input_path: Path to input PDF
        pages: 'all' or comma-separated page numbers
    
    Returns:
        Path to output CSV file
    """
    ensure_temp_dir()
    output_path = get_temp_path(f"tables_{uuid.uuid4().hex}.csv")

    doc = fitz.open(input_path)

    # Parse page selection
    if pages == "all":
        page_indices = range(len(doc))
    else:
        try:
            page_indices = [int(p.strip()) - 1 for p in pages.split(",")]
            page_indices = [p for p in page_indices if 0 <= p < len(doc)]
        except ValueError:
            page_indices = range(len(doc))

    all_rows = []

    for pg_idx in page_indices:
        page = doc[pg_idx]

        # Try PyMuPDF's built-in table finder (available in recent versions)
        try:
            tabs = page.find_tables()
            for table in tabs:
                for row in table.extract():
                    cleaned = [str(cell).strip() if cell else "" for cell in row]
                    if any(cleaned):  # Skip empty rows
                        all_rows.append(cleaned)
                # Add empty row between tables
                if all_rows and all_rows[-1]:
                    all_rows.append([])
        except AttributeError:
            # Fallback: extract text and try to parse as table
            text = page.get_text("text")
            for line in text.split("\n"):
                line = line.strip()
                if line:
                    # Split by multiple spaces (common in PDF tables)
                    cells = [c.strip() for c in line.split("  ") if c.strip()]
                    if len(cells) > 1:
                        all_rows.append(cells)

    doc.close()

    if not all_rows:
        raise ValueError("No tables found in the PDF")

    # Write CSV
    with open(str(output_path), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for row in all_rows:
            writer.writerow(row)

    return str(output_path)
