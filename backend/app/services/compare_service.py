import uuid
import difflib
import io
import pikepdf
from PIL import Image, ImageChops
from pdf2image import convert_from_path
import pypdf
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def compare_text(path1: str, path2: str) -> dict:
    def extract_text(path):
        pages = []
        reader = pypdf.PdfReader(path)
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        return pages

    pages1 = extract_text(path1)
    pages2 = extract_text(path2)

    text1 = "\n".join(pages1)
    text2 = "\n".join(pages2)

    diff = list(difflib.unified_diff(
        text1.splitlines(),
        text2.splitlines(),
        fromfile="file1.pdf",
        tofile="file2.pdf",
        lineterm=""
    ))

    return {
        "diff": diff,
        "page_count_1": len(pages1),
        "page_count_2": len(pages2),
    }


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    color = (hex_color or "").strip().lstrip("#")
    if len(color) == 3:
        color = "".join(ch * 2 for ch in color)
    if len(color) != 6:
        return (255, 0, 0)
    try:
        return (int(color[0:2], 16), int(color[2:4], 16), int(color[4:6], 16))
    except ValueError:
        return (255, 0, 0)


def compare_visual(path1: str, path2: str, highlight_color: str = "#ff0000") -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"compare_visual_{uuid.uuid4().hex}.pdf")
    color = _hex_to_rgb(highlight_color)

    images1 = convert_from_path(path1, dpi=150)
    images2 = convert_from_path(path2, dpi=150)

    max_pages = max(len(images1), len(images2))
    result_images = []

    for i in range(max_pages):
        if i < len(images1) and i < len(images2):
            img1 = images1[i].convert("RGB")
            img2 = images2[i].convert("RGB")
            # Resize to same dimensions
            w = max(img1.width, img2.width)
            h = max(img1.height, img2.height)
            img1 = img1.resize((w, h), Image.Resampling.LANCZOS)
            img2 = img2.resize((w, h), Image.Resampling.LANCZOS)
            diff = ImageChops.difference(img1, img2)
            # Highlight differences in red
            diff_arr = diff.split()
            red_mask = diff_arr[0].point(lambda x: 255 if x > 10 else 0)
            highlighted = img1.copy()
            red_layer = Image.new("RGB", (w, h), color)
            highlighted.paste(red_layer, mask=red_mask)
            result_images.append(highlighted)
        elif i < len(images1):
            result_images.append(images1[i].convert("RGB"))
        else:
            result_images.append(images2[i].convert("RGB"))

    if not result_images:
        raise ValueError("No pages to compare")

    first = result_images[0]
    rest = result_images[1:]
    first.save(str(output_path), format="PDF", save_all=True, append_images=rest)

    return str(output_path)
