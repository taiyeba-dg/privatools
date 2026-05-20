"""Tests for the shared page-range parser (app.utils.page_range).

Once the per-service copies were retired, every page-range bug is
guaranteed to surface in one of these tests rather than in production.
"""

import sys
from pathlib import Path

import pytest

sys.path.append(str(Path(__file__).resolve().parents[2]))

from backend.app.utils.page_range import parse_page_range


def test_all_returns_every_page():
    assert parse_page_range("all", 5) == [0, 1, 2, 3, 4]


def test_individual_pages():
    assert parse_page_range("1,3,5", 5) == [0, 2, 4]


def test_range_with_end_keyword():
    assert parse_page_range("1-end", 5) == [0, 1, 2, 3, 4]


def test_open_start_and_end_ranges():
    assert parse_page_range("-3,4-", 5) == [0, 1, 2, 3, 4]


def test_deduplicates_preserving_order():
    assert parse_page_range("1,1-3,3-end,end", 5) == [0, 1, 2, 3, 4]


def test_standalone_end_token():
    assert parse_page_range("end", 5) == [4]


def test_whitespace_tolerant():
    assert parse_page_range(" 1 , 2 ", 5) == [0, 1]


@pytest.mark.parametrize("spec", ["0", "8", "-", "4-2", "abc"])
def test_invalid_specs_raise(spec):
    with pytest.raises(ValueError):
        parse_page_range(spec, total_pages=5)


def test_empty_with_allow_empty_returns_blank():
    assert parse_page_range("", 5, allow_empty=True) == []


def test_empty_without_allow_empty_raises():
    with pytest.raises(ValueError):
        parse_page_range("", 5)


def test_zero_pages_always_raises():
    with pytest.raises(ValueError):
        parse_page_range("1", total_pages=0)


def test_huge_token_is_rejected_before_int_conversion():
    """`int('9' * 10_000_000)` would otherwise eat ~50 MB of RAM —
    we cap token length so parsing fails fast on bogus input."""
    big = "9" * 50
    with pytest.raises(ValueError):
        parse_page_range(big, 10)
