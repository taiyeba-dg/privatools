"""Tests for the shared hex-color helpers (app.utils.colors)."""

import sys
from pathlib import Path

import pytest

sys.path.append(str(Path(__file__).resolve().parents[2]))

from backend.app.utils.colors import (
    hex_to_rgb_float,
    hex_to_rgb_int,
    parse_hex_color,
)


def test_six_digit_hex_roundtrip():
    assert hex_to_rgb_float("#ff0000") == (1.0, 0.0, 0.0)
    assert hex_to_rgb_int("#ff0000") == (255, 0, 0)


def test_three_digit_hex_expands():
    assert hex_to_rgb_float("#f00") == (1.0, 0.0, 0.0)
    assert hex_to_rgb_int("#0f0") == (0, 255, 0)


def test_no_hash_prefix():
    assert hex_to_rgb_float("00ff00") == (0.0, 1.0, 0.0)


def test_uppercase_hex():
    assert hex_to_rgb_int("#FFA500") == (255, 165, 0)


def test_invalid_returns_default():
    assert hex_to_rgb_float("garbage") == (0.0, 0.0, 0.0)
    assert hex_to_rgb_float("garbage", default=(1.0, 1.0, 1.0)) == (1.0, 1.0, 1.0)
    assert hex_to_rgb_int("not-a-color", default=(10, 20, 30)) == (10, 20, 30)


def test_invalid_empty_string_returns_default():
    assert hex_to_rgb_float("") == (0.0, 0.0, 0.0)


def test_parse_hex_color_raises_on_invalid():
    with pytest.raises(ValueError):
        parse_hex_color("not-a-color")


def test_parse_hex_color_returns_floats():
    r, g, b = parse_hex_color("#80c0ff")
    assert r == pytest.approx(0x80 / 255.0)
    assert g == pytest.approx(0xC0 / 255.0)
    assert b == pytest.approx(0xFF / 255.0)
