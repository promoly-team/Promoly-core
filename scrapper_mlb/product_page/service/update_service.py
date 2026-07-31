import os
import requests
from bs4 import BeautifulSoup
from scrapper_mlb.block_detection import is_blocked
from scrapper_mlb.config import HEADERS
from scrapper_mlb.http_client import backoff, rate_limiter
from scrapper_mlb.product_page.update_builder import build_product_page

DEBUG_DIR = "debug_html"

session = requests.Session()
session.headers.update(HEADERS)


def clean_url(url: str) -> str:
    return url.split("#")[0]


# 🔥 Função interna que executa UMA tentativa
def _collect_once(url: str, produto_id: int):
    try:
        url = clean_url(url)

        # 🔥 Mesmo rate limiter/backoff da listagem (politeness global)
        rate_limiter.wait()
        response = session.get(url, timeout=15, allow_redirects=True)

        if response.status_code != 200:
            print(f"⚠️ Status inválido: {response.status_code}")
            backoff.error()
            return None

        # 🔥 Detecção de bloqueio unificada (block_detection)
        if is_blocked(response.text):
            print(f"🚨 BLOQUEIO detectado para ID={produto_id}")
            backoff.error()
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        page_data = build_product_page(soup)
        backoff.success()

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
        backoff.error()
        return None


# 🔥 Função pública com retry automático
def collect_product_by_url(url: str, produto_id: int, retries: int = 1):
    for attempt in range(retries + 1):

        page_data = _collect_once(url, produto_id)

        if page_data is not None:
            return page_data

        if attempt < retries:
            print(f"🔁 Retry {attempt + 1}/{retries} para ID={produto_id}")
            # Espera com backoff exponencial (inflado pelo backoff.error()
            # disparado no _collect_once em caso de erro/bloqueio).
            backoff.wait()

    print(f"❌ Falha definitiva para ID={produto_id}")
    return None
