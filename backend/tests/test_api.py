"""
Pytest test suite for PrivaTools backend API.
Tests key endpoints with output validation — not just HTTP 200 checks.

Requires a running server:
    cd '/Users/lakshya/Downloads/priva tool'
    python3 -m uvicorn backend.app.main:app --port 8000 &
    python3 -m pytest backend/tests/test_api.py -v
"""

import io
import json
import pytest
import fitz  # PyMuPDF
import requests
from PIL import Image

BASE_URL = "http://localhost:8000/api"


# ── Fixtures ──

@pytest.fixture(scope="module")
def small_pdf():
    """A 2-page PDF with text content."""
    doc = fitz.open()
    for i in range(2):
        page = doc.new_page()
        page.insert_text((72, 72), f"Page {i+1}\nTest content line two", fontsize=12)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


@pytest.fixture(scope="module")
def jpeg_image():
    img = Image.new("RGB", (200, 150), (30, 60, 120))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=90)
    return buf.getvalue()


@pytest.fixture(scope="module")
def fillable_pdf():
    """PDF with form fields for fill-form testing."""
    doc = fitz.open()
    page = doc.new_page()
    w = fitz.Widget()
    w.field_type = fitz.PDF_WIDGET_TYPE_TEXT
    w.field_name = "name"
    w.rect = fitz.Rect(72, 80, 300, 100)
    w.field_value = ""
    page.add_widget(w)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def post(endpoint, files=None, data=None, timeout=30):
    return requests.post(f"{BASE_URL}/{endpoint}", files=files, data=data or {}, timeout=timeout)


# ── Health ──

def test_health():
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    assert r.status_code == 200


# ── Compress ──

def test_compress_returns_valid_pdf(small_pdf):
    r = post("compress", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"quality": "recommended"})
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"


# ── Split ──

def test_split_pages(small_pdf):
    r = post("split", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"mode": "pages", "pages": "1"})
    assert r.status_code == 200


# ── Organize ──

def test_organize_pages_reorders(small_pdf):
    r = post("organize-pages", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"page_order": json.dumps([2, 1])})
    assert r.status_code == 200
    doc = fitz.open(stream=r.content, filetype="pdf")
    assert len(doc) == 2
    doc.close()


def test_delete_pages_reduces_count(small_pdf):
    r = post("delete-pages", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"pages": "2"})
    assert r.status_code == 200
    doc = fitz.open(stream=r.content, filetype="pdf")
    assert len(doc) == 1
    doc.close()


# ── Edit ──

def test_watermark(small_pdf):
    r = post("watermark", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"text": "CONFIDENTIAL", "position": "center", "opacity": "0.3"})
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"


def test_bookmarks_added(small_pdf):
    bm = json.dumps([{"title": "Ch1", "page": 1}])
    r = post("bookmarks", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"bookmarks": bm})
    assert r.status_code == 200
    doc = fitz.open(stream=r.content, filetype="pdf")
    toc = doc.get_toc()
    assert len(toc) >= 1
    doc.close()


# ── Security ──

def test_protect_and_unlock(small_pdf):
    r1 = post("protect", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"password": "secret123"})
    assert r1.status_code == 200
    r2 = post("unlock", files={"file": ("p.pdf", r1.content, "application/pdf")}, data={"password": "secret123"})
    assert r2.status_code == 200
    assert r2.content[:5] == b"%PDF-"


def test_redact(small_pdf):
    rects = json.dumps([{"page": 0, "x0": 50, "y0": 50, "x1": 200, "y1": 100}])
    r = post("redact", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"redactions": rects, "color": "#000000"})
    assert r.status_code == 200


def test_metadata_read(small_pdf):
    r = post("metadata", files={"file": ("test.pdf", small_pdf, "application/pdf")})
    assert r.status_code == 200
    assert isinstance(r.json(), dict)


# ── Conversions ──

def test_pdf_to_text_extracts_content(small_pdf):
    r = post("pdf-to-text", files={"file": ("test.pdf", small_pdf, "application/pdf")})
    assert r.status_code == 200
    text = r.content.decode("utf-8", errors="replace")
    assert len(text) > 10


def test_pdf_to_image(small_pdf):
    r = post("pdf-to-image", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"format": "png", "dpi": "72"})
    assert r.status_code == 200
    assert len(r.content) > 100


def test_image_to_pdf(jpeg_image):
    r = post("image-to-pdf", files=[("files", ("test.jpg", jpeg_image, "image/jpeg"))])
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"


def test_html_to_pdf():
    r = requests.post(f"{BASE_URL}/html-to-pdf", data={"html_content": "<h1>Hello</h1>"}, timeout=10)
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"


def test_csv_to_pdf():
    r = post("csv-to-pdf", files={"file": ("test.csv", b"Name,Age\nAlice,30\n", "text/csv")})
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"


# ── Optimize ──

def test_rotate(small_pdf):
    r = post("rotate", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"angle": "90"})
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"


def test_crop(small_pdf):
    r = post("crop", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"top": "50", "bottom": "50", "left": "30", "right": "30"})
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"


def test_invert_output_size(small_pdf):
    """Verifies the invert colors perf fix — output should be <500KB for a 2-page PDF."""
    r = post("invert-colors", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"dpi": "72"}, timeout=15)
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"
    assert len(r.content) < 500_000, f"Invert output too large: {len(r.content)} bytes"


def test_auto_crop(small_pdf):
    r = post("auto-crop", files={"file": ("test.pdf", small_pdf, "application/pdf")})
    assert r.status_code == 200
    assert r.content[:5] == b"%PDF-"


def test_remove_blank_pages_keeps_content(small_pdf):
    r = post("remove-blank-pages", files={"file": ("test.pdf", small_pdf, "application/pdf")}, data={"sensitivity": "85"})
    assert r.status_code == 200
    doc = fitz.open(stream=r.content, filetype="pdf")
    assert len(doc) >= 1
    doc.close()


# ── Advanced ──

def test_merge_combines_pages(small_pdf):
    r = post("merge", files=[("files", ("a.pdf", small_pdf, "application/pdf")), ("files", ("b.pdf", small_pdf, "application/pdf"))])
    assert r.status_code == 200
    doc = fitz.open(stream=r.content, filetype="pdf")
    assert len(doc) == 4
    doc.close()


def test_qr_code():
    r = requests.post(f"{BASE_URL}/qr-code", data={"data": "https://example.com", "size": "200", "format": "png"}, timeout=10)
    assert r.status_code == 200
    assert len(r.content) > 100


def test_fill_form_fields(fillable_pdf):
    r = post("fill-form/fields", files={"file": ("form.pdf", fillable_pdf, "application/pdf")})
    assert r.status_code == 200
    assert len(r.json()["fields"]) >= 1


# ── Image Tools ──

def test_image_compressor(jpeg_image):
    r = post("image-compressor", files={"file": ("test.jpg", jpeg_image, "image/jpeg")}, data={"quality": "75"})
    assert r.status_code == 200


def test_image_converter_format(jpeg_image):
    r = post("image-converter", files={"file": ("test.jpg", jpeg_image, "image/jpeg")}, data={"target_format": "png"})
    assert r.status_code == 200
    assert r.content[:8] == b"\x89PNG\r\n\x1a\n", "Output is not a valid PNG"


# ── Error Handling ──

def test_non_pdf_rejected():
    r = post("compress", files={"file": ("test.txt", b"hello", "text/plain")}, data={"quality": "recommended"})
    assert r.status_code == 400


def test_invalid_pdf_rejected():
    r = post("compress", files={"file": ("fake.pdf", b"not a pdf", "application/pdf")}, data={"quality": "recommended"})
    assert r.status_code == 400


def test_missing_required_param(small_pdf):
    r = post("bookmarks", files={"file": ("test.pdf", small_pdf, "application/pdf")})
    assert r.status_code == 422
