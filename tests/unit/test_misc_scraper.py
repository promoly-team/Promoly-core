import os
import pytest
from decimal import Decimal

from scrapper_mlb.parser import parse_html, find_product_nodes
from scrapper_mlb.models import Product
from scrapper_mlb.services.product_builder import build_card_hash, build_product
from scrapper_mlb.services import url_builder
from scrapper_mlb import config_flags
from tests.conftest import make_soup

pytestmark = pytest.mark.unit


class TestParser:
    def test_parse_html_returns_soup(self):
        soup = parse_html("<html><body><p>x</p></body></html>")
        assert soup.find("p").text == "x"

    def test_find_product_nodes(self):
        html = '<ul><li class="ui-search-layout__item">a</li>' \
               '<li class="ui-search-layout__item">b</li></ul>'
        nodes = find_product_nodes(parse_html(html))
        assert len(nodes) == 2

    def test_find_product_nodes_empty_raises(self):
        with pytest.raises(ValueError):
            find_product_nodes(parse_html("<ul></ul>"))


class TestCardHash:
    def test_deterministic(self):
        kw = dict(product_id="MLB1", preco=Decimal("10"),
                  desconto=5, avaliacao=Decimal("4.5"), buyers=100)
        assert build_card_hash(**kw) == build_card_hash(**kw)

    def test_changes_with_input(self):
        base = dict(product_id="MLB1", preco=Decimal("10"),
                    desconto=5, avaliacao=Decimal("4.5"), buyers=100)
        other = {**base, "preco": Decimal("11")}
        assert build_card_hash(**base) != build_card_hash(**other)


class TestBuildProduct:
    def test_valid(self, minimal_item):
        product = build_product(minimal_item)
        assert isinstance(product, Product)
        assert product.id_produto == "MLB12345678"
        assert product.preco == Decimal("199.90")
        assert product.card_hash

    def test_invalid_link_raises(self):
        item = make_soup("<li><span>x</span></li>").select_one("li")
        with pytest.raises(ValueError):
            build_product(item)


class TestUrlBuilder:
    def setup_method(self):
        url_builder.URL_MLB_SEARCH_BASE = "https://lista.mercadolivre.com.br"

    def test_basic(self):
        assert url_builder.build_search_url("fone bluetooth") == \
            "https://lista.mercadolivre.com.br/fone-bluetooth"

    def test_pagination(self):
        url = url_builder.build_search_url("fone", page=2)
        assert url.endswith("_Desde_49")

    def test_category_and_filters(self):
        url = url_builder.build_search_url(
            "fone", category="MLB1055", filters={"PriceRange": "100-500"}
        )
        assert "/MLB1055" in url and "_PriceRange_100-500" in url

    def test_raises_without_base(self):
        url_builder.URL_MLB_SEARCH_BASE = None
        with pytest.raises(RuntimeError):
            url_builder.build_search_url("fone")


class TestConfigFlags:
    def test_none_when_unset(self, monkeypatch):
        monkeypatch.delenv("SCRAPER_ENABLED_CATEGORIES", raising=False)
        assert config_flags.get_enabled_categories() is None

    def test_parses_list(self, monkeypatch):
        monkeypatch.setenv("SCRAPER_ENABLED_CATEGORIES", "casa, pet ,games")
        assert config_flags.get_enabled_categories() == ["casa", "pet", "games"]
