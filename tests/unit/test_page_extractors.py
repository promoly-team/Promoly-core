import pytest
from decimal import Decimal

from tests.conftest import make_soup
from scrapper_mlb.product_page.extractors.price import extract_page_price
from scrapper_mlb.product_page.extractors.rating import extract_page_rating

pytestmark = pytest.mark.unit


class TestExtractPagePrice:
    def test_visible_state_block(self):
        html = '<script>{"price":{"state":"VISIBLE","value":199.90}}</script>'
        assert extract_page_price(make_soup(html)) == Decimal("199.90")

    def test_json_ld_fallback(self):
        html = (
            '<script type="application/ld+json">'
            '{"offers": {"price": "299.00"}}</script>'
        )
        assert extract_page_price(make_soup(html)) == Decimal("299.00")

    def test_missing(self):
        assert extract_page_price(make_soup("<div>nada</div>")) is None


class TestExtractPageRating:
    def test_present(self):
        html = '<span class="ui-pdp-review__rating">4.7</span>'
        assert extract_page_rating(make_soup(html)) == Decimal("4.7")

    def test_missing(self):
        assert extract_page_rating(make_soup("<div>x</div>")) is None

    def test_invalid(self):
        html = '<span class="ui-pdp-review__rating">N/A</span>'
        assert extract_page_rating(make_soup(html)) is None
