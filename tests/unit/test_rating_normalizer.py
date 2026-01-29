import pytest
from decimal import Decimal

from scrapper_mlb.services.normalizers.rating import normalize_rating


@pytest.mark.unit
class TestNormalizeRating:
    def test_valid_rating(self):
        assert normalize_rating("4.8") == Decimal("4.8")

    def test_none_rating(self):
        assert normalize_rating(None) is None

    def test_invalid_rating(self):
        assert normalize_rating("abc") is None
