import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()

URL_MLB_SEARCH_BASE = os.getenv("URL_MLB_SEARCH_BASE")

# Tamanho da página de busca do ML (offset de paginação _Desde_). Hardcoded
# antes; agora configurável caso o ML mude o page size.
ML_PAGE_SIZE = int(os.getenv("ML_PAGE_SIZE", "48"))


def build_search_url(
    query: str,
    *,
    page: int = 1,
    category: str | None = None,
    filters: dict[str, str] | None = None,
) -> str:
    """
    Gera URL de busca do Mercado Livre a partir de termo, página e filtros.

    Exemplo:
    - fone bluetooth
    - page=2
    - filters={"PriceRange": "100-500"}
    """

    if not URL_MLB_SEARCH_BASE:
        raise RuntimeError("URL_MLB_SEARCH_BASE não definida no ambiente")

    # Normaliza termo de busca
    query_slug = quote_plus(query.strip().replace(" ", "-"))

    url = f"{URL_MLB_SEARCH_BASE}/{query_slug}"

    # Categoria (ex: /MLB1055)
    if category:
        url += f"/{category}"

    # Paginação: _Desde_49
    if page > 1:
        offset = (page - 1) * ML_PAGE_SIZE + 1
        url += f"_Desde_{offset}"

    # Filtros adicionais
    if filters:
        for key, value in filters.items():
            url += f"_{key}_{value}"

    return url
