import os
import time
import requests
from bs4 import BeautifulSoup
from scrapper_mlb.config import HEADERS
from scrapper_mlb.product_page.update_builder import build_product_page

DEBUG_DIR = "debug_html"

session = requests.Session()
session.headers.update(HEADERS)


def is_block_page(soup: BeautifulSoup) -> bool:
    # Detecta bloqueio REAL
    if soup.select_one(".account-verification-header"):
        return True

    if soup.select_one(".new-user-button"):
        return True

    if "Olá! Para continuar, acesse" in soup.get_text():
        return True

    return False


def clean_url(url: str) -> str:
    return url.split("#")[0]


# 🔥 Função interna que executa UMA tentativa
def _collect_once(url: str, produto_id: int):
    try:
        url = clean_url(url)

        response = session.get(url, timeout=15, allow_redirects=True)

        if response.status_code != 200:
            print(f"⚠️ Status inválido: {response.status_code}")
            return None

        soup = BeautifulSoup(response.text, "html.parser")

        # 🔥 Detecta bloqueio real
        if is_block_page(soup):
            print(f"🚨 BLOQUEIO detectado para ID={produto_id}")
            return None

        page_data = build_product_page(soup)

        # 🔥 Debug se não tiver preço
        if page_data.preco is None:
            os.makedirs(DEBUG_DIR, exist_ok=True)
            with open(
                os.path.join(DEBUG_DIR, f"sem_preco_{produto_id}.html"),
                "w",
                encoding="utf-8",
            ) as f:
                f.write(response.text)

            print(f"📝 HTML salvo (sem preço) ID={produto_id}")

        return page_data

    except requests.RequestException as e:
        print(f"⚠️ Erro de requisição: {e}")
        return None


# 🔥 Função pública com retry automático
def collect_product_by_url(url: str, produto_id: int, retries: int = 1):
    for attempt in range(retries + 1):

        page_data = _collect_once(url, produto_id)

        if page_data is not None:
            return page_data

        if attempt < retries:
            print(f"🔁 Retry {attempt + 1}/{retries} para ID={produto_id}")
            time.sleep(5)

    print(f"❌ Falha definitiva para ID={produto_id}")
    return None
