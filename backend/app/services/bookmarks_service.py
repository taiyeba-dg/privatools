import pikepdf
import uuid
import json
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def add_bookmarks(input_path: str, bookmarks_json: str) -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"bookmarked_{uuid.uuid4().hex}.pdf")

    bookmarks_data = json.loads(bookmarks_json)

    with pikepdf.open(input_path) as pdf:
        total_pages = len(pdf.pages)

        with pdf.open_outline() as outline:
            outline.root.clear()
            for item in bookmarks_data:
                title = str(item.get("title", "")).strip()
                page_num = int(item.get("page", 1))
                if not title:
                    continue
                # Clamp page number to valid range
                page_num = max(1, min(page_num, total_pages))
                outline_item = pikepdf.OutlineItem(title, page_num - 1)
                outline.root.append(outline_item)

        pdf.save(str(output_path))

    return str(output_path)
