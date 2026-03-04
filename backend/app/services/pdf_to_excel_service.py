"""PDF to Excel conversion using PyMuPDF + openpyxl."""
import uuid
import fitz
from openpyxl import Workbook
from pathlib import Path
from ..utils.cleanup import get_temp_path, ensure_temp_dir


async def convert_to_excel(input_path: str) -> str:
    ensure_temp_dir()
    doc = fitz.open(input_path)
    wb = Workbook()
    ws = wb.active
    ws.title = "Page 1"

    row = 1
    for page_num in range(len(doc)):
        page = doc[page_num]
        if page_num > 0:
            ws = wb.create_sheet(title=f"Page {page_num + 1}")
            row = 1

        # Try extracting tables first
        try:
            tables = page.find_tables()
            if tables and len(tables.tables) > 0:
                for table in tables.tables:
                    for trow in table.extract():
                        for col, cell in enumerate(trow, 1):
                            ws.cell(row=row, column=col, value=cell or "")
                        row += 1
                    row += 1
                continue
        except Exception:
            pass

        # Fallback: extract text line by line
        text = page.get_text("text")
        for line in text.split("\n"):
            line = line.strip()
            if line:
                ws.cell(row=row, column=1, value=line)
                row += 1

    doc.close()
    output_path = get_temp_path(f"converted_{uuid.uuid4().hex}.xlsx")
    wb.save(str(output_path))
    return str(output_path)
