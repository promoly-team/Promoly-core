import pytest

from scrapper_mlb.pricing.query_rules import get_price_range_by_query
from scrapper_mlb.pricing.service import resolve_price_range
from scrapper_mlb.pricing.base_ranges import PRICE_RANGES

pytestmark = pytest.mark.unit


class TestQueryRules:
    def test_smartwatch(self):
        assert get_price_range_by_query("Smartwatch X") == (120, 2000)

    def test_case_insensitive(self):
        assert get_price_range_by_query("FONE BLUETOOTH") == (80, 1200)

    def test_controle_variants(self):
        assert get_price_range_by_query("controle ps5") == (150, 600)

    def test_unknown_returns_none(self):
        assert get_price_range_by_query("guarda-chuva") is None


class TestResolvePriceRange:
    def test_query_rule_wins(self):
        # query específica vence faixa base da categoria
        assert resolve_price_range("casa", "monitor") == (500, 4000)

    def test_category_base(self):
        assert resolve_price_range("casa", "produto qualquer") == PRICE_RANGES["casa"]

    def test_fallback(self):
        assert resolve_price_range("inexistente", "produto qualquer") == (50, 1000)
