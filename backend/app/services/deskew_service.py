import uuid
import fitz  # PyMuPDF
from ..utils.cleanup import get_temp_path, ensure_temp_dir


def _detect_skew_angle_fast(pix: fitz.Pixmap) -> float:
    """Fast skew detection using row-sum variance at coarse then fine granularity."""
    import math
    
    w, h = pix.width, pix.height
    samples = pix.samples
    
    # Use every 3rd row and every 3rd column for speed
    step = 3
    
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
    
    # Coarse search: -5 to +5 in 1° steps (11 checks)
    best_angle = 0.0
    best_var = -1.0
    for angle_int in range(-5, 6):
        v = compute_variance(float(angle_int))
        if v > best_var:
            best_var = v
            best_angle = float(angle_int)
    
    # Fine search: ±1° around best in 0.2° steps (10 checks)
    for angle_tenth in range(int((best_angle - 1) * 5), int((best_angle + 1) * 5) + 1):
        angle = angle_tenth * 0.2
        v = compute_variance(angle)
        if v > best_var:
            best_var = v
            best_angle = angle
    
    return best_angle


def deskew(input_path: str) -> str:
    """Deskew PDF pages using PyMuPDF with fast angle detection."""
    ensure_temp_dir()
    output_path = get_temp_path(f"deskewed_{uuid.uuid4().hex}.pdf")

    src = fitz.open(input_path)
    dst = fitz.open()

    for page in src:
        # Render at low DPI for fast skew detection
        detect_mat = fitz.Matrix(0.5, 0.5)  # 36 DPI — very fast
        detect_pix = page.get_pixmap(matrix=detect_mat, colorspace=fitz.csGRAY)
        
        angle = _detect_skew_angle_fast(detect_pix)
        
        if abs(angle) > 0.1:
            # Render at full quality and rotate
            mat = fitz.Matrix(150 / 72, 150 / 72)
            pix = page.get_pixmap(matrix=mat)
            
            from PIL import Image
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            rotated = img.rotate(-angle, expand=True, fillcolor=(255, 255, 255),
                                resample=Image.Resampling.BICUBIC)
            
            # Save rotated PIL image to bytes for fitz
            import io
            img_buf = io.BytesIO()
            rotated.save(img_buf, format="PNG")
            img_buf.seek(0)
            
            new_page = dst.new_page(width=page.rect.width, height=page.rect.height)
            new_page.insert_image(new_page.rect, stream=img_buf.getvalue())
        else:
            # No rotation needed — just copy the page directly (super fast)
            dst.insert_pdf(src, from_page=page.number, to_page=page.number)

    if len(dst) == 0:
        raise ValueError("No pages found in PDF")

    dst.save(str(output_path), garbage=4, deflate=True)
    dst.close()
    src.close()

    return str(output_path)
