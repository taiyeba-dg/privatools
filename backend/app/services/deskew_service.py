import os
import uuid
import math
import io
from concurrent.futures import ThreadPoolExecutor
import fitz  # PyMuPDF
from PIL import Image
from ..utils.cleanup import get_temp_path, ensure_temp_dir

_MAX_WORKERS = min(os.cpu_count() or 2, 4)


def _detect_skew_angle_fast(pix: fitz.Pixmap) -> float:
    """Ultra-fast skew detection using row-sum variance."""
    w, h = pix.width, pix.height
    samples = pix.samples

    # Use every 4th pixel for maximum speed
    step = 4

    def compute_variance(angle: float) -> float:
        rad = math.radians(angle)
        cos_a, sin_a = math.cos(rad), math.sin(rad)
        cx, cy = w / 2, h / 2

        row_sums = []
        for yr in range(0, h, step):
            row_sum = 0
            for xr in range(0, w, step):
                sx = int(cos_a * (xr - cx) + sin_a * (yr - cy) + cx)
                sy = int(-sin_a * (xr - cx) + cos_a * (yr - cy) + cy)
                if 0 <= sx < w and 0 <= sy < h:
                    row_sum += 255 - samples[sy * w + sx]
            row_sums.append(row_sum)

        if not row_sums:
            return 0.0
        mean = sum(row_sums) / len(row_sums)
        return sum((s - mean) ** 2 for s in row_sums) / len(row_sums)

    # Coarse: -5 to +5 in 2° steps (6 checks)
    best_angle = 0.0
    best_var = -1.0
    for a in range(-4, 6, 2):
        v = compute_variance(float(a))
        if v > best_var:
            best_var = v
            best_angle = float(a)

    # Fine: ±2° around best in 0.5° steps (8 checks)
    for a5 in range(int((best_angle - 2) * 2), int((best_angle + 2) * 2) + 1):
        angle = a5 * 0.5
        v = compute_variance(angle)
        if v > best_var:
            best_var = v
            best_angle = angle

    return best_angle


def _detect_and_deskew_page(args: tuple) -> tuple:
    """Detect skew and deskew a single page. Returns (idx, pdf_bytes_or_None, needs_original)."""
    idx, page_bytes = args

    doc = fitz.open(stream=page_bytes, filetype="pdf")
    page = doc[0]

    # Ultra-low DPI for detection
    detect_pix = page.get_pixmap(matrix=fitz.Matrix(0.4, 0.4), colorspace=fitz.csGRAY)
    angle = _detect_skew_angle_fast(detect_pix)

    if abs(angle) <= 0.3:
        doc.close()
        return (idx, None, True)  # Keep original page

    # Render at 100 DPI and rotate
    pix = page.get_pixmap(matrix=fitz.Matrix(100 / 72, 100 / 72))
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    rotated = img.rotate(-angle, expand=True, fillcolor=(255, 255, 255),
                         resample=Image.Resampling.BICUBIC)

    img_buf = io.BytesIO()
    rotated.save(img_buf, format="PNG")
    png_bytes = img_buf.getvalue()

    w, h = page.rect.width, page.rect.height
    doc.close()

    return (idx, (w, h, png_bytes), False)


def deskew(input_path: str) -> str:
    """Deskew PDF pages using parallel skew detection."""
    ensure_temp_dir()
    output_path = get_temp_path(f"deskewed_{uuid.uuid4().hex}.pdf")

    src = fitz.open(input_path)
    page_count = len(src)

    if page_count <= 2:
        # Few pages — direct sequential
        dst = fitz.open()
        for page in src:
            detect_pix = page.get_pixmap(matrix=fitz.Matrix(0.4, 0.4), colorspace=fitz.csGRAY)
            angle = _detect_skew_angle_fast(detect_pix)

            if abs(angle) > 0.3:
                pix = page.get_pixmap(matrix=fitz.Matrix(100 / 72, 100 / 72))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                rotated = img.rotate(-angle, expand=True, fillcolor=(255, 255, 255),
                                     resample=Image.Resampling.BICUBIC)
                img_buf = io.BytesIO()
                rotated.save(img_buf, format="PNG")
                new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
                new_page.insert_image(new_page.rect, stream=img_buf.getvalue())
            else:
                dst.insert_pdf(src, from_page=page.number, to_page=page.number)

        if len(dst) == 0:
            raise ValueError("No pages found in PDF")
        dst.save(str(output_path), garbage=4, deflate=True)
        dst.close()
        src.close()
        return str(output_path)

    # Multi-page — parallel processing
    page_pdfs = []
    for i in range(page_count):
        single = fitz.open()
        single.insert_pdf(src, from_page=i, to_page=i)
        page_pdfs.append(single.tobytes())
        single.close()
    src_copy = fitz.open(input_path)  # Keep open for original page insertion

    tasks = [(i, pb) for i, pb in enumerate(page_pdfs)]

    results = [None] * page_count
    with ThreadPoolExecutor(max_workers=_MAX_WORKERS) as pool:
        for idx, data, needs_original in pool.map(_detect_and_deskew_page, tasks):
            results[idx] = (data, needs_original)

    # Assemble
    dst = fitz.open()
    for i, (data, needs_original) in enumerate(results):
        if needs_original:
            dst.insert_pdf(src_copy, from_page=i, to_page=i)
        else:
            w, h, png_bytes = data
            new_page = dst.new_page(width=w, height=h)
            new_page.insert_image(new_page.rect, stream=png_bytes)

    if len(dst) == 0:
        raise ValueError("No pages found in PDF")

    dst.save(str(output_path), garbage=4, deflate=True)
    dst.close()
    src_copy.close()

    return str(output_path)
