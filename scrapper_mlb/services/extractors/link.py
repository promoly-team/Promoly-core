from urllib.parse import urljoin, urlparse
from scrapper_mlb.config import URL_MLB_BASE

URL_MLB_BASE

def extract_link(item):
    """
    Extrai o link do produto a partir do card.
    Retorna None se não for um produto válido.
    """

    # 1️⃣ Tentativa principal: link do título
    a_tag = item.select_one("a[href]")

    if not a_tag:
        return None

    href = a_tag.get("href")
    if not href:
        return None

    # 2️⃣ Normaliza link relativo
    if href.startswith("/"):
        href = urljoin(URL_MLB_BASE, href)

    # 3️⃣ Validação mínima: precisa ser URL do ML
    parsed = urlparse(href)

    if "mercadolivre.com.br" not in parsed.netloc:
        return None

    return href
