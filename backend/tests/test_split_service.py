import sys
from pathlib import Path

import pytest

sys.path.append(str(Path(__file__).resolve().parents[2]))

from backend.app.services.split_service import parse_page_selection


def test_parse_page_selection_supports_end_and_mixed_ranges():
    result = parse_page_selection("1-3,5,7-end", total_pages=10)
    assert result == [0, 1, 2, 4, 6, 7, 8, 9]


def test_parse_page_selection_supports_open_ranges():
    result = parse_page_selection("-3,8-", total_pages=10)
    assert result == [0, 1, 2, 7, 8, 9]


def test_parse_page_selection_deduplicates_preserving_order():
    result = parse_page_selection("1,1-3,3-end,end", total_pages=5)
    assert result == [0, 1, 2, 3, 4]


@pytest.mark.parametrize("pages", ["", "0", "-", "4-2", "abc", "8"])
def test_parse_page_selection_rejects_invalid_ranges(pages: str):
    with pytest.raises(ValueError):
        parse_page_selection(pages, total_pages=5)
