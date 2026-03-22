"""
Tests for the SPA catch-all fallback route and sitemap slug consistency.
"""
import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

ROOT = Path(__file__).resolve().parents[2]

client = TestClient(app)


# ---------------------------------------------------------------------------
# SPA catch-all tests
# ---------------------------------------------------------------------------

class TestSPAFallback:
    """Verify that the SPA fallback serves index.html for frontend routes."""

    @pytest.mark.parametrize("path", [
        "/tool/merge-pdf",
        "/tool/compress-pdf",
        "/tool/split-pdf",
        "/tools/image-compressor",
        "/tools/remove-background",
        "/about",
        "/compare",
        "/compare/ilovepdf",
        "/batch",
        "/pipeline",
    ])
    def test_frontend_routes_return_200_html(self, path):
        """Frontend SPA routes must return 200 with HTML content."""
        resp = client.get(path)
        # If frontend/dist exists with index.html, we get 200
        # If not (CI without build), we get 404 — skip
        if resp.status_code == 404:
            pytest.skip("frontend/dist not built — skipping SPA fallback test")
        assert resp.status_code == 200
        assert "text/html" in resp.headers.get("content-type", "")

    def test_api_routes_not_intercepted(self):
        """API routes must still return JSON, not index.html."""
        resp = client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}

    def test_static_files_served_directly(self):
        """Real static files (e.g. robots.txt) should be served as-is."""
        resp = client.get("/robots.txt")
        if resp.status_code == 404:
            pytest.skip("frontend/dist not built — skipping static file test")
        assert resp.status_code == 200
        assert "User-agent" in resp.text

    def test_path_traversal_blocked(self):
        """Path traversal attempts must be rejected."""
        resp = client.get("/../../etc/passwd")
        assert resp.status_code in (400, 404)


# ---------------------------------------------------------------------------
# Sitemap slug consistency tests
# ---------------------------------------------------------------------------

def _parse_sitemap_slugs() -> tuple[list[str], list[str]]:
    """Parse PDF and non-PDF slugs from the sitemap route file."""
    sitemap_file = ROOT / "backend" / "app" / "routes" / "sitemap.py"
    text = sitemap_file.read_text(encoding="utf-8")

    # Extract the PDF_TOOLS list
    pdf_match = re.search(r"PDF_TOOLS\s*=\s*\[(.*?)\]", text, re.DOTALL)
    pdf_slugs = re.findall(r'"([^"]+)"', pdf_match.group(1)) if pdf_match else []

    # Extract the NON_PDF_TOOLS list
    non_pdf_match = re.search(r"NON_PDF_TOOLS\s*=\s*\[(.*?)\]", text, re.DOTALL)
    non_pdf_slugs = re.findall(r'"([^"]+)"', non_pdf_match.group(1)) if non_pdf_match else []

    return pdf_slugs, non_pdf_slugs


def _parse_frontend_slugs(filename: str) -> set[str]:
    """Parse slugs from a frontend data file."""
    data_file = ROOT / "frontend" / "src" / "data" / filename
    text = data_file.read_text(encoding="utf-8")
    return set(re.findall(r'slug:\s*"([^"]+)"', text))


def test_sitemap_pdf_slugs_match_frontend():
    """Every PDF slug in the sitemap must exist in tools.ts."""
    sitemap_pdf, _ = _parse_sitemap_slugs()
    frontend_pdf = _parse_frontend_slugs("tools.ts")

    missing = [s for s in sitemap_pdf if s not in frontend_pdf]
    assert not missing, (
        f"Sitemap PDF slugs not found in tools.ts: {missing}"
    )


def test_sitemap_non_pdf_slugs_match_frontend():
    """Every non-PDF slug in the sitemap must exist in non-pdf-tools.ts."""
    _, sitemap_non_pdf = _parse_sitemap_slugs()
    frontend_non_pdf = _parse_frontend_slugs("non-pdf-tools.ts")

    missing = [s for s in sitemap_non_pdf if s not in frontend_non_pdf]
    assert not missing, (
        f"Sitemap non-PDF slugs not found in non-pdf-tools.ts: {missing}"
    )


def test_frontend_pdf_slugs_in_sitemap():
    """Every PDF slug in tools.ts should be in the sitemap."""
    sitemap_pdf, _ = _parse_sitemap_slugs()
    frontend_pdf = _parse_frontend_slugs("tools.ts")

    missing = [s for s in frontend_pdf if s not in sitemap_pdf]
    assert not missing, (
        f"Frontend tools.ts slugs missing from sitemap: {missing}"
    )


def test_frontend_non_pdf_slugs_in_sitemap():
    """Every non-PDF slug in non-pdf-tools.ts should be in the sitemap."""
    _, sitemap_non_pdf = _parse_sitemap_slugs()
    frontend_non_pdf = _parse_frontend_slugs("non-pdf-tools.ts")

    missing = [s for s in frontend_non_pdf if s not in sitemap_non_pdf]
    assert not missing, (
        f"Frontend non-pdf-tools.ts slugs missing from sitemap: {missing}"
    )
