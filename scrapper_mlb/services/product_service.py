from scrapper_mlb.http_client import fetch_html
from scrapper_mlb.parser import parse_html
from scrapper_mlb.parser import find_product_nodes
from scrapper_mlb.services.product_builder import build_product


def collect_products(url: str):
    html = fetch_html(url)
    soup = parse_html(html)
    nodes = find_product_nodes(soup)

    products = []
    for item in nodes:
        product = build_product(item)
        products.append(product)

    return products