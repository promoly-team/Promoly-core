from scrapper_mlb.http_client import fetch_html
from scrapper_mlb.parser import parse_html
from scrapper_mlb.parser import find_product_nodes
from scrapper_mlb.services.product_builder import build_product
from scrapper_mlb.services.url_builder import build_search_url



def collect_products(url: str):
    html = fetch_html(url)
    soup = parse_html(html)
    nodes = find_product_nodes(soup)

    products = []

    for item in nodes:
        try:
            product = build_product(item)
            products.append(product)
        except ValueError:
            # Item não representa um produto válido
            # (card patrocinado, placeholder, layout alternativo, etc.)
            continue

    return products


def collect_products_by_query(
    query: str,
    *,
    max_pages: int = 1,
    filters: dict[str, str] | None = None,
) -> list:
    """
    Coleta produtos para um termo de busca.
    """

    all_products = []

    for page in range(1, max_pages + 1):
        url = build_search_url(
            query,
            page=page,
            filters=filters,
        )
        print(f"[DEBUG] URL gerada: {url}")
        products = collect_products(url)

    

        if not products:
            break

        all_products.extend(products)

    return all_products
