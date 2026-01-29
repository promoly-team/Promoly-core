import pytest
from decimal import Decimal

from scrapper_mlb.services.normalizers.price import normalize_price


@pytest.mark.unit
class TestNormalizePrice:
    def test_integer_price(self):
        assert normalize_price("199") == Decimal("199.00")

    def test_decimal_price(self):
        assert normalize_price("199,90") == Decimal("199.90")

    def test_thousand_price(self):
        assert normalize_price("1.299,90") == Decimal("1299.90")

    def test_thousand_without_cents(self):
        assert normalize_price("12.999") == Decimal("12999.00")

    def test_none_input(self):
        assert normalize_price(None) is None

    def test_invalid_input(self):
        assert normalize_price("abc") is None
