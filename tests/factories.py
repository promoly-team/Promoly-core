"""Factories (factory_boy) compartilhadas pelos testes.

Centraliza a construção de objetos de domínio, controladores e respostas
HTTP falsas, evitando montar objetos à mão em cada teste.
"""
from decimal import Decimal

import factory

from scrapper_mlb.http_client import BackoffController, RateLimiter
from scrapper_mlb.models import Product
from scrapper_mlb.product_page.models import ProductPageData


class ProductFactory(factory.Factory):
    class Meta:
        model = Product

    id_produto = factory.Sequence(lambda n: f"MLB{1000 + n}")
    descricao = factory.Faker("sentence", nb_words=3)
    preco = factory.LazyFunction(lambda: Decimal("199.90"))
    avaliacao = factory.LazyFunction(lambda: Decimal("4.5"))
    desconto = None
    link = factory.LazyAttribute(
        lambda o: f"https://produto.mercadolivre.com.br/{o.id_produto}"
    )
    imagem_url = "https://http2.mlstatic.com/x.webp"
    buyers = 100
    card_hash = factory.Faker("sha256")


class ProductPageDataFactory(factory.Factory):
    class Meta:
        model = ProductPageData

    preco = factory.LazyFunction(lambda: Decimal("149.90"))
    avaliacao = factory.LazyFunction(lambda: Decimal("4.2"))
    status = None


class RateLimiterFactory(factory.Factory):
    class Meta:
        model = RateLimiter

    min_interval = 0.05


class BackoffControllerFactory(factory.Factory):
    class Meta:
        model = BackoffController

    base_delay = 0.01
    max_delay = 0.1
    factor = 2.0


class FakeResponse:
    """Resposta HTTP mínima compatível com o uso em update_service."""

    def __init__(self, status_code: int = 200, text: str = ""):
        self.status_code = status_code
        self.text = text


class FakeResponseFactory(factory.Factory):
    class Meta:
        model = FakeResponse

    status_code = 200
    # HTML "válido" o suficiente para não bater nos markers de bloqueio.
    text = "<html><body>ui-search-layout__item produto ok</body></html>"
