from PIL import Image
import uuid
from ..utils.cleanup import get_temp_path, ensure_temp_dir
from reportlab.lib.pagesizes import A4, LETTER
from reportlab.platypus import SimpleDocTemplate, Image as RLImage

PAGE_SIZES = {
    "A4": A4,
    "Letter": LETTER,
}


def images_to_pdf(input_paths: list, page_size: str = "A4") -> str:
    ensure_temp_dir()
    output_path = get_temp_path(f"images_to_pdf_{uuid.uuid4().hex}.pdf")
    size = PAGE_SIZES.get(page_size, A4)

    doc = SimpleDocTemplate(str(output_path), pagesize=size)
    story = []

    page_width, page_height = size
    margin = 36  # 0.5 inch
    max_width = page_width - 2 * margin
    max_height = page_height - 2 * margin

    for path in input_paths:
        with Image.open(path) as img:
            img_width, img_height = img.size

        ratio = min(max_width / img_width, max_height / img_height)
        new_width = img_width * ratio
        new_height = img_height * ratio

        rl_img = RLImage(path, width=new_width, height=new_height)
        story.append(rl_img)

    doc.build(story)
    return str(output_path)
