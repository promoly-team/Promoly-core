from scrapper_mlb.http_client import fetch_html
from scrapper_mlb.parser import parse_html
from scrapper_mlb.parser import find_product_nodes
from scrapper_mlb.services.product_builder import build_product
from scrapper_mlb.services.url_builder import build_search_url

#///////////

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

from concurrent.futures import ThreadPoolExecutor, as_completed


def collect_products_by_query(
    query: str,
    *,
    max_pages: int = 1,
    filters: dict[str, str] | None = None,
) -> list:

    all_products = []
    seen_ids = set()

    def fetch_page(page: int):
        url = build_search_url(
            query,
            page=page,
            filters=filters,
        )
        print(f"[DEBUG] URL: {url}")
        return collect_products(url)

    # 🔥 Paraleliza páginas
    with ThreadPoolExecutor(max_workers=min(5, max_pages)) as executor:
        futures = {
            executor.submit(fetch_page, page): page
            for page in range(1, max_pages + 1)
        }

        for future in as_completed(futures):
            try:
                products = future.result()

                if not products:
                    continue

                for p in products:
                    if p.id_produto not in seen_ids:
                        seen_ids.add(p.id_produto)
                        all_products.append(p)

            except Exception as e:
                print(f"⚠️ Erro ao coletar página: {e}")

    return all_products