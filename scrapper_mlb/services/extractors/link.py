import re
from urllib.parse import urljoin, urlparse, urlunparse
from scrapper_mlb.config import URL_MLB_BASE


def extract_link(item):
    """
    Extrai somente o link canônico do produto.
    Ignora links patrocinados, busca e tracking.
    """

    # Pega TODOS os <a> do card
    anchors = item.select("a[href]")

    for a in anchors:
        href = a.get("href")
        if not href:
            continue

        # Normaliza relativo
        if href.startswith("/"):
            href = urljoin(URL_MLB_BASE, href)

        parsed = urlparse(href)

        # Precisa ser domínio ML válido
        if "mercadolivre.com.br" not in parsed.netloc:
            continue

        # Ignora links de busca
        if "lista.mercadolivre" in parsed.netloc:
            continue

        # Ignora tracking click1
        if "click1.mercadolivre" in parsed.netloc:
            continue

        # 🔥 Regra principal: precisa conter um ID de produto MLB no path.
        # Aceita tanto catálogo (/p/MLB123) quanto listing
        # (produto.mercadolivre.com.br/MLB-123 ou /MLB123).
        if re.search(r"/(p/)?MLB-?\d+", parsed.path):
            # Remove querystring (tracking)
            clean_url = urlunparse(
                (parsed.scheme, parsed.netloc, parsed.path, "", "", "")
            )
            return clean_url

    return None
