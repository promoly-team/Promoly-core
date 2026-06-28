import pytest

from tests.conftest import make_soup
from scrapper_mlb.services.extractors.price import extract_price
from scrapper_mlb.services.extractors.link import extract_link
from scrapper_mlb.services.extractors.buyers import extract_buyers
from scrapper_mlb.services.extractors.image import extract_image
from scrapper_mlb.services.extractors.rating import extract_rating
from scrapper_mlb.services.extractors.shipping import extract_shipping
from scrapper_mlb.services.extractors.description import extract_description
from scrapper_mlb.services.extractors.discount import extract_discount
from scrapper_mlb.services.extractors.product_id import extract_product_id

pytestmark = pytest.mark.unit


def _item(html):
    return make_soup(f"<li>{html}</li>").select_one("li")


class TestExtractPrice:
    def test_with_cents(self, minimal_item):
        assert extract_price(minimal_item) == "199,90"

    def test_only_integer(self):
        item = _item('<span class="andes-money-amount__fraction">99</span>')
        assert extract_price(item) == "99"

    def test_missing(self):
        assert extract_price(_item("<span></span>")) is None


class TestExtractLink:
    def test_absolute(self, minimal_item):
        assert extract_link(minimal_item).endswith("MLB12345678")

    def test_strips_querystring(self):
        item = _item(
            '<a href="https://produto.mercadolivre.com.br/MLB-123?ref=abc">x</a>'
        )
        assert extract_link(item) == "https://produto.mercadolivre.com.br/MLB-123"

    def test_ignores_search_domain(self):
        item = _item('<a href="https://lista.mercadolivre.com.br/MLB-123">x</a>')
        assert extract_link(item) is None

    def test_no_product_id(self):
        item = _item('<a href="https://www.mercadolivre.com.br/ofertas">x</a>')
        assert extract_link(item) is None

    def test_no_anchor(self):
        assert extract_link(_item("<span>x</span>")) is None


class TestExtractImage:
    def test_src(self, minimal_item):
        assert extract_image(minimal_item).startswith("https://")

    def test_data_src_fallback(self):
        item = _item(
            '<img class="poly-component__picture" '
            'src="data:image/png;base64,xx" '
            'data-src="https://http2.mlstatic.com/x.webp">'
        )
        assert extract_image(item) == "https://http2.mlstatic.com/x.webp"

    def test_regex_fallback(self):
        item = _item('<div>https://http2.mlstatic.com/y.webp</div>')
        assert extract_image(item) == "https://http2.mlstatic.com/y.webp"

    def test_missing(self):
        assert extract_image(_item("<span>x</span>")) is None


class TestExtractRatingBuyers:
    def test_rating(self, minimal_item):
        assert extract_rating(minimal_item) == "4.8"

    def test_buyers(self, minimal_item):
        assert extract_buyers(minimal_item) == "+500 vendidos"

    def test_rating_missing(self):
        assert extract_rating(_item("<span>x</span>")) is None

    def test_buyers_single_label(self):
        item = _item(
            '<div class="poly-component__review-compacted">'
            '<span class="poly-phrase-label">4.8</span></div>'
        )
        assert extract_buyers(item) is None


class TestExtractShipping:
    def test_promise(self, minimal_item):
        assert extract_shipping(minimal_item) == "Chega amanhã"

    def test_with_extra(self):
        item = _item(
            '<div class="poly-component__shipping">'
            '<span class="poly-shipping--promise_day">Amanhã</span>'
            '<span class="poly-shipping__additional_text">Frete grátis</span>'
            "</div>"
        )
        assert extract_shipping(item) == "Amanhã (Frete grátis)"

    def test_missing(self):
        assert extract_shipping(_item("<span>x</span>")) is None


class TestExtractDescription:
    def test_present(self, minimal_item):
        assert "Fone" in extract_description(minimal_item)

    def test_missing(self):
        assert extract_description(_item("<span>x</span>")) is None


class TestExtractDiscount:
    def test_percent_off(self):
        item = _item(
            '<span class="andes-money-amount__discount">20% OFF</span>'
        )
        assert extract_discount(item) == "20% OFF"

    def test_missing(self):
        assert extract_discount(_item("<span>x</span>")) is None


class TestExtractProductId:
    def test_with_dash(self):
        assert extract_product_id("https://x/MLB-123") == "MLB123"

    def test_without_dash(self):
        assert extract_product_id("https://x/MLB123") == "MLB123"

    def test_none(self):
        assert extract_product_id(None) is None

    def test_no_match(self):
        assert extract_product_id("https://x/ofertas") is None
