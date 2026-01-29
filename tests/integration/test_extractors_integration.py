
import re
from decimal import Decimal
from pathlib import Path

import pytest

pytestmark = [
    pytest.mark.scraping,
    pytest.mark.integration,
]
from bs4 import BeautifulSoup

from scrapper_mlb.services.extractors.buyers import extract_buyers
from scrapper_mlb.services.extractors.description import extract_description
from scrapper_mlb.services.extractors.image import extract_image
from scrapper_mlb.services.extractors.link import extract_link
from scrapper_mlb.services.extractors.price import extract_price
from scrapper_mlb.services.extractors.product_id import extract_product_id
from scrapper_mlb.services.extractors.rating import extract_rating
from scrapper_mlb.services.extractors.shipping import extract_shipping
from scrapper_mlb.services.normalizers.price import normalize_price

PRICE_REGEX = re.compile(r"^\d{1,3}(\.\d{3})*(,\d{2})?$")
HTML_PATH = Path("tests/fixtures/fone_bluetooth_ml.html")

@pytest.mark.usefixtures("first_item")
class TestExtractShipping:
    def test_shipping_extraction(self, first_item):
        shipping = extract_shipping(first_item)

        # Pode ser None, mas não pode quebrar
        if shipping is not None:
            assert isinstance(shipping, str)
            assert shipping.strip() != ""



@pytest.mark.usefixtures("first_item")
class TestExtractPrice:
    def test_price_exists(self, first_item):
        price = extract_price(first_item)
        assert price is not None

    def test_price_is_string(self, first_item):
        price = extract_price(first_item)
        assert isinstance(price, str)

    def test_price_format_brl(self, first_item):
        price = extract_price(first_item)

        assert PRICE_REGEX.match(price), (
            f"Preço fora do padrão BRL esperado: {price}"
        )

@pytest.mark.integration
@pytest.mark.scraping
class TestPriceIntegration:
    def test_extracted_price_can_be_normalized(self, first_item):
        raw_price = extract_price(first_item)
        price = normalize_price(raw_price)

        assert price is not None
        assert isinstance(price, Decimal)
        assert price > 0


@pytest.mark.usefixtures("first_item")
class TestExtractProductId:
    def test_product_id_extracted_from_link(self, first_item):
        link = extract_link(first_item)
        product_id = extract_product_id(link)

        assert product_id is not None
        assert product_id.startswith("MLB")
        assert product_id[3:].isdigit()


@pytest.mark.usefixtures("first_item")
class TestExtractRating:
    def test_rating_exists(self, first_item):
        rating = extract_rating(first_item)

        assert rating is not None
        assert rating.replace(".", "").isdigit()


@pytest.mark.usefixtures("first_item")
class TestExtractLink:
    def test_link_exists(self, first_item):
        link = extract_link(first_item)

        assert link is not None
        assert link.startswith("http")

    def test_link_is_mercado_livre(self, first_item):
        link = extract_link(first_item)
        assert "mercadolivre.com.br" in link


@pytest.mark.usefixtures("first_item")
class TestExtractDescription:
    def test_description_exists(self, first_item):
        description = extract_description(first_item)

        assert description is not None
        assert len(description.strip()) > 5


@pytest.mark.usefixtures("first_item")
class TestExtractBuyers:
    def test_buyers_exists(self, first_item):
        buyers = extract_buyers(first_item)

        assert buyers is not None




@pytest.mark.usefixtures("first_item")
class TestExtractImage:
    def test_image_exists(self, first_item):
        image = extract_image(first_item)

        assert image is not None

    def test_image_is_public_url(self, first_item):
        image = extract_image(first_item)

        assert image.startswith("http")

    def test_image_is_not_base64(self, first_item):
        image = extract_image(first_item)

        assert not image.startswith("data:image")
