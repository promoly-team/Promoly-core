import pytest
from decimal import Decimal

pytestmark = [
    pytest.mark.scraping,
    pytest.mark.integration,
]

from scrapper_mlb.services.product_builder import build_product
from scrapper_mlb.models import Product


@pytest.mark.integration
@pytest.mark.scraping
class TestBuildProductIntegration:
    def test_build_product_from_real_html(self, first_item):
        product = build_product(first_item)

        assert isinstance(product, Product)
        assert product.preco > Decimal("0")
