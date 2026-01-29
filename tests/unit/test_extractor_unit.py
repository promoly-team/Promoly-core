import pytest

pytestmark = [
    pytest.mark.unit,
]

from scrapper_mlb.services.extractors.price import extract_price
from scrapper_mlb.services.extractors.link import extract_link
from scrapper_mlb.services.extractors.buyers import extract_buyers
from scrapper_mlb.services.extractors.image import extract_image

@pytest.mark.usefixtures("minimal_item")
class TestExtractPriceUnit:
    def test_price(self, minimal_item):
        price = extract_price(minimal_item)
        assert price == "199,90"

@pytest.mark.usefixtures("minimal_item")
class TestExtractLinkUnit:
    def test_link(self, minimal_item):
        link = extract_link(minimal_item)
        assert link.endswith("MLB12345678")

@pytest.mark.usefixtures("minimal_item")
class TestExtractLinkUnit:
    def test_link(self, minimal_item):
        link = extract_link(minimal_item)
        assert link.endswith("MLB12345678")

@pytest.mark.usefixtures("minimal_item")
class TestExtractImageUnit:
    def test_image(self, minimal_item):
        image = extract_image(minimal_item)
        assert image.startswith("https://")

@pytest.mark.usefixtures("minimal_item")
class TestExtractBuyersUnit:
    def test_buyers(self, minimal_item):
        buyers = extract_buyers(minimal_item)
        assert buyers == "+500 vendidos"
