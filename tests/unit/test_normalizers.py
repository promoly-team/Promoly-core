import pytest
from decimal import Decimal

from scrapper_mlb.services.normalizers.price import normalize_price
from scrapper_mlb.services.normalizers.rating import normalize_rating
from scrapper_mlb.services.normalizers.discount import normalize_discount
from scrapper_mlb.services.normalizers.buyers import normalize_buyers

pytestmark = pytest.mark.unit


class TestNormalizePrice:
    def test_integer(self):
        assert normalize_price("199") == Decimal("199.00")

    def test_decimal_br(self):
        assert normalize_price("199,90") == Decimal("199.90")

    def test_thousand(self):
        assert normalize_price("1.299,90") == Decimal("1299.90")

    def test_thousand_no_cents(self):
        assert normalize_price("12.999") == Decimal("12999.00")

    def test_none(self):
        assert normalize_price(None) is None

    def test_empty(self):
        assert normalize_price("") is None

    def test_invalid(self):
        assert normalize_price("abc") is None


class TestNormalizeRating:
    def test_valid(self):
        assert normalize_rating("4.8") == Decimal("4.8")

    def test_none(self):
        assert normalize_rating(None) is None

    def test_empty(self):
        assert normalize_rating("") is None

    def test_invalid(self):
        assert normalize_rating("ótimo") is None


class TestNormalizeDiscount:
    def test_percent(self):
        assert normalize_discount("20% OFF") == 20

    def test_plain_number(self):
        assert normalize_discount("5") == 5

    def test_none(self):
        assert normalize_discount(None) is None

    def test_empty(self):
        assert normalize_discount("") is None

    def test_no_digits(self):
        assert normalize_discount("OFF") is None


class TestNormalizeBuyers:
    def test_simple(self):
        assert normalize_buyers("+500 vendidos") == 500

    def test_thousand(self):
        assert normalize_buyers("+1.200 vendidos") == 1200

    def test_none(self):
        assert normalize_buyers(None) is None

    def test_empty(self):
        assert normalize_buyers("") is None

    def test_no_plus(self):
        assert normalize_buyers("vendidos") is None
