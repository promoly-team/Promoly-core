# scrapper_mlb/pricing/service.py

from scrapper_mlb.pricing.base_ranges import PRICE_RANGES
from scrapper_mlb.pricing.query_rules import get_price_range_by_query


def resolve_price_range(categoria_slug: str, query: str):
    """
    Resolve a faixa de preço ideal combinando:

    1. Regra específica por query
    2. Faixa base da categoria
    3. Fallback padrão
    """

    # 1️⃣ Regra específica da query
    query_range = get_price_range_by_query(query)
    if query_range:
        return query_range

    # 2️⃣ Base da categoria
    if categoria_slug in PRICE_RANGES:
        return PRICE_RANGES[categoria_slug]

    # 3️⃣ Fallback geral
    return (50, 1000)
