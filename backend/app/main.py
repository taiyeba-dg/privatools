import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .routes import (
    merge, split, compress, pdf_to_image, image_to_pdf, rotate, protect,
    unlock, watermark, pdf_to_word, page_numbers, ocr, office_to_pdf, metadata,
    extract_pages, delete_pages, pdf_to_text, pdf_to_excel, pdf_to_pptx,
    strip_metadata, delete_annotations, repair, crop, resize, flatten,
    header_footer, bates_numbering, grayscale, bookmarks, pdf_to_pdfa,
    extract_images, organize_pages, alternate_mix, split_bookmarks, split_by_size,
    nup, overlay, fill_form, compare, deskew,
    sign, redact, html_to_pdf, edit_pdf, qr_code,
    remove_blank_pages, auto_crop, invert_colors, pdf_security, pdf_extra,
    non_pdf_tools, image_ocr,
    phase1_tools,
    phase2_tools,
    phase3_tools,
    phase4_tools,
    phase5_tools,
    reverse_pdf,
    booklet,
    sitemap,
)
from .utils.cleanup import cleanup_old_files, ensure_temp_dir


async def _cleanup_task():
    """Remove temp files older than 10 minutes, runs every 5 minutes."""
    while True:
        await asyncio.sleep(300)
        cleanup_old_files(600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_temp_dir()
    task = asyncio.create_task(_cleanup_task())
    yield
    task.cancel()


_is_prod = os.environ.get("ENVIRONMENT", "").lower() == "production"


def _env_positive_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None:
        return default
    try:
        return max(1, int(raw))
    except ValueError:
        return default


# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------
_rate_limit = os.environ.get("RATE_LIMIT", "30/minute")
limiter = Limiter(key_func=get_remote_address, default_limits=[_rate_limit])

# ---------------------------------------------------------------------------
# Security headers middleware
# ---------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if request.url.scheme == "https" or os.environ.get("FORCE_HSTS"):
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: blob:; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        return response

# ---------------------------------------------------------------------------
# Max upload size (100 MB)
# ---------------------------------------------------------------------------
MAX_UPLOAD_BYTES = _env_positive_int("MAX_UPLOAD_MB", 100) * 1024 * 1024

class UploadSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > MAX_UPLOAD_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={"detail": f"File too large. Maximum upload size is {MAX_UPLOAD_BYTES // (1024*1024)} MB."},
                )
        return await call_next(request)


app = FastAPI(
    title="PDF Studio API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if _is_prod else "/docs",
    redoc_url=None if _is_prod else "/redoc",
)

# Wire rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:8000,http://localhost:8080").split(",")

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(UploadSizeLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Include all routers
app.include_router(merge.router, prefix="/api")
app.include_router(split.router, prefix="/api")
app.include_router(compress.router, prefix="/api")
app.include_router(pdf_to_image.router, prefix="/api")
app.include_router(image_to_pdf.router, prefix="/api")
app.include_router(rotate.router, prefix="/api")
app.include_router(protect.router, prefix="/api")
app.include_router(unlock.router, prefix="/api")
app.include_router(watermark.router, prefix="/api")
app.include_router(pdf_to_word.router, prefix="/api")
app.include_router(page_numbers.router, prefix="/api")
app.include_router(ocr.router, prefix="/api")
app.include_router(office_to_pdf.router, prefix="/api")
app.include_router(metadata.router, prefix="/api")
app.include_router(extract_pages.router, prefix="/api")
app.include_router(delete_pages.router, prefix="/api")
app.include_router(pdf_to_text.router, prefix="/api")
app.include_router(pdf_to_excel.router, prefix="/api")
app.include_router(pdf_to_pptx.router, prefix="/api")
app.include_router(strip_metadata.router, prefix="/api")
app.include_router(delete_annotations.router, prefix="/api")
app.include_router(repair.router, prefix="/api")
app.include_router(crop.router, prefix="/api")
app.include_router(resize.router, prefix="/api")
app.include_router(flatten.router, prefix="/api")
app.include_router(header_footer.router, prefix="/api")
app.include_router(bates_numbering.router, prefix="/api")
app.include_router(grayscale.router, prefix="/api")
app.include_router(bookmarks.router, prefix="/api")
app.include_router(pdf_to_pdfa.router, prefix="/api")
app.include_router(extract_images.router, prefix="/api")
app.include_router(organize_pages.router, prefix="/api")
app.include_router(alternate_mix.router, prefix="/api")
app.include_router(split_bookmarks.router, prefix="/api")
app.include_router(split_by_size.router, prefix="/api")
app.include_router(nup.router, prefix="/api")
app.include_router(overlay.router, prefix="/api")
app.include_router(fill_form.router, prefix="/api")
app.include_router(compare.router, prefix="/api")
app.include_router(deskew.router, prefix="/api")
app.include_router(sign.router, prefix="/api")
app.include_router(redact.router, prefix="/api")
app.include_router(html_to_pdf.router, prefix="/api")
app.include_router(edit_pdf.router, prefix="/api")
app.include_router(qr_code.router, prefix="/api")

# New PDF tool routes
app.include_router(remove_blank_pages.router, prefix="/api")
app.include_router(auto_crop.router, prefix="/api")
app.include_router(invert_colors.router, prefix="/api")
app.include_router(pdf_security.router, prefix="/api")
app.include_router(pdf_extra.router, prefix="/api")

# Non-PDF tool routes
app.include_router(non_pdf_tools.router, prefix="/api")
app.include_router(image_ocr.router, prefix="/api")

# Phase 1 new tools
app.include_router(phase1_tools.router, prefix="/api")
app.include_router(phase2_tools.router, prefix="/api")
app.include_router(phase3_tools.router, prefix="/api")
app.include_router(phase4_tools.router, prefix="/api")
app.include_router(phase5_tools.router, prefix="/api")
app.include_router(reverse_pdf.router, prefix="/api")
app.include_router(booklet.router, prefix="/api")

# Sitemap
app.include_router(sitemap.router)


@app.get("/api/health")
async def health():
    return JSONResponse({"status": "ok"})


# Mount frontend static files (only if the directory exists)
def _resolve_frontend_path() -> Path:
    if "FRONTEND_PATH" in os.environ:
        return Path(os.environ["FRONTEND_PATH"])
    # Built frontend output
    cwd_dist = Path.cwd() / "frontend" / "dist"
    if cwd_dist.exists():
        return cwd_dist
    rel_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
    if rel_dist.exists():
        return rel_dist
    # Fallback to frontend root
    cwd_path = Path.cwd() / "frontend"
    if cwd_path.exists():
        return cwd_path
    return Path(__file__).parent.parent.parent / "frontend"

_frontend_path = _resolve_frontend_path()
if _frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(_frontend_path), html=True), name="frontend")
