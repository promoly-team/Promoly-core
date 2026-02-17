from scrapper_mlb.product_page.models import ProductPageData
from scrapper_mlb.product_page.extractors.price import extract_page_price
from scrapper_mlb.product_page.extractors.rating import extract_page_rating


def build_product_page(soup):
    price = extract_page_price(soup)
    rating = extract_page_rating(soup)

    return ProductPageData(
        preco=price,
        avaliacao=rating,
        status=None,
    )
