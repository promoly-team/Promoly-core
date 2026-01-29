import pytest
from bs4 import BeautifulSoup
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def make_soup(html: str) -> BeautifulSoup:
    """
    Cria BeautifulSoup usando lxml se disponível,
    com fallback para html.parser.
    """
    try:
        return BeautifulSoup(html, "lxml")
    except Exception:
        return BeautifulSoup(html, "html.parser")


@pytest.fixture(scope="session")
def ml_html():
    path = BASE_DIR / "fixtures" / "mock_scrapping_mlb.html"
    return path.read_text(encoding="utf-8")


@pytest.fixture(scope="session")
def soup(ml_html):
    return make_soup(ml_html)


@pytest.fixture(scope="session")
def first_item(soup):
    item = soup.select_one("li.ui-search-layout__item")
    assert item is not None, "Nenhum item encontrado na página"
    return item


@pytest.fixture
def minimal_item():
    html = """
    <li class="ui-search-layout__item">
        <a class="poly-component__title"
           href="https://produto.mercadolivre.com.br/MLB12345678">
           Fone Bluetooth XYZ
        </a>

        <span class="andes-money-amount__fraction">199</span>
        <span class="andes-money-amount__cents">90</span>

        <div class="poly-component__shipping">
            <span class="poly-shipping--promise_day">Chega amanhã</span>
        </div>

        <div class="poly-component__review-compacted">
            <span class="poly-phrase-label">4.8</span>
            <span class="poly-phrase-label">+500 vendidos</span>
        </div>

        <img class="poly-component__picture"
             src="https://http2.mlstatic.com/fone.webp" />
    </li>
    """
    soup = make_soup(html)
    return soup.select_one("li")
