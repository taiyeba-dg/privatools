"""Filename- and traversal-safety unit tests.

Companion to the existing test_colors.py / test_page_range.py / test_split_service.py.
This file specifically pins the lower-level safety guards that prevent malicious
filenames from escaping the temp sandbox or colliding inside generated ZIPs.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.app.utils.route_helpers import safe_filename, unique_arcname
from backend.app.utils.cleanup import get_temp_path


# ---------------------------------------------------------------------------
# route_helpers.safe_filename
# ---------------------------------------------------------------------------

class TestSafeFilename:
    def test_strips_unix_directory_components(self):
        assert safe_filename("../../etc/passwd.pdf") == "passwd.pdf"
        assert safe_filename("/etc/passwd.pdf") == "passwd.pdf"

    def test_strips_null_bytes(self):
        assert safe_filename("test\x00.pdf") == "test.pdf"

    def test_strips_combined_traversal_plus_null(self):
        assert safe_filename("../../etc/passwd\x00.pdf") == "passwd.pdf"

    def test_none_falls_back(self):
        assert safe_filename(None) == "file"
        assert safe_filename(None, "custom.pdf") == "custom.pdf"

    def test_empty_falls_back(self):
        assert safe_filename("") == "file"

    def test_normal_filename_passes_through(self):
        assert safe_filename("report.pdf") == "report.pdf"


# ---------------------------------------------------------------------------
# route_helpers.unique_arcname
# ---------------------------------------------------------------------------

class TestUniqueArcname:
    """Without unique_arcname two uploads named 'report.pdf' collide in a ZIP —
    only one survives in most extractors. Pin the dedup behaviour here."""

    def test_first_occurrence_unchanged(self):
        seen: dict = {}
        assert unique_arcname("report.pdf", seen) == "report.pdf"
        assert seen == {"report.pdf": 1}

    def test_duplicate_gets_counter_suffix(self):
        seen: dict = {}
        unique_arcname("report.pdf", seen)
        assert unique_arcname("report.pdf", seen) == "report_2.pdf"
        assert unique_arcname("report.pdf", seen) == "report_3.pdf"

    def test_no_extension(self):
        seen: dict = {}
        unique_arcname("README", seen)
        assert unique_arcname("README", seen) == "README_2"

    def test_different_names_dont_collide(self):
        seen: dict = {}
        assert unique_arcname("a.pdf", seen) == "a.pdf"
        assert unique_arcname("b.pdf", seen) == "b.pdf"


# ---------------------------------------------------------------------------
# cleanup.get_temp_path traversal guard
# ---------------------------------------------------------------------------

class TestGetTempPath:
    """get_temp_path is THE chokepoint where a malicious filename would have
    to bypass to escape the temp dir. Test it directly."""

    def test_strips_directory_components(self, tmp_path, monkeypatch):
        from backend.app.utils import cleanup as _cleanup
        monkeypatch.setattr(_cleanup, "TEMP_DIR", tmp_path)
        p = get_temp_path("../../etc/passwd")
        # Must land inside the sandbox, not above it
        assert p.parent == tmp_path
        assert p.name == "passwd"

    def test_strips_absolute_path(self, tmp_path, monkeypatch):
        from backend.app.utils import cleanup as _cleanup
        monkeypatch.setattr(_cleanup, "TEMP_DIR", tmp_path)
        p = get_temp_path("/etc/passwd")
        assert p.parent == tmp_path
        assert p.name == "passwd"

    def test_empty_after_stripping_raises(self, tmp_path, monkeypatch):
        from backend.app.utils import cleanup as _cleanup
        from fastapi import HTTPException
        monkeypatch.setattr(_cleanup, "TEMP_DIR", tmp_path)
        with pytest.raises(HTTPException) as exc:
            get_temp_path("/")
        assert exc.value.status_code == 400
