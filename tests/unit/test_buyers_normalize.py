import pytest

from scrapper_mlb.services.normalizers.buyers import normalize_buyers


@pytest.mark.unit
class TestNormalizeBuyers:
    def test_simple_buyers(self):
        assert normalize_buyers("+500 vendidos") == 500

    def test_thousand_buyers(self):
        assert normalize_buyers("+1.200 vendidos") == 1200

    def test_none_buyers(self):
        assert normalize_buyers(None) is None

    def test_invalid_buyers(self):
        assert normalize_buyers("vendidos") is None
