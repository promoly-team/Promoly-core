import random
import time
from pathlib import Path

import requests

from scrapper_mlb.config import HEADERS


DEBUG_PATH = Path("scrapper_mlb_debug.html")

MIN_HTML_SIZE = 50_000
MAX_HTML_SIZE = 5_000_000
MAX_RETRIES = 3


class BackoffController:
    def __init__(self, base_delay=2.0, max_delay=30.0, factor=2.0):
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.factor = factor
        self.current_delay = base_delay

    def success(self):
        self.current_delay = self.base_delay

    def error(self):
        self.current_delay = min(self.current_delay * self.factor, self.max_delay)

    def wait(self):
        delay = random.uniform(self.current_delay * 0.8, self.current_delay * 1.2)
        time.sleep(delay)


class RateLimiter:
    def __init__(self, min_interval: float):
        self.min_interval = min_interval
        self.last_request = 0.0

    def wait(self):
        now = time.time()
        elapsed = now - self.last_request

        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)

        self.last_request = time.time()


# 🔥 Use apenas uma instância
rate_limiter = RateLimiter(min_interval=5.0)
backoff = BackoffController()

# 🔥 Sessão persistente
session = requests.Session()
session.headers.update(HEADERS)


def is_blocked(html: str) -> bool:
    html_lower = html.lower()

    block_markers = [
        "captcha",
        "verify you are human",
        "access denied",
        "unusual traffic",
        "suspicious_traffic",
        "account-verification",
    ]

    return any(marker in html_lower for marker in block_markers)


def fetch_html(url: str) -> str:
    for attempt in range(1, MAX_RETRIES + 1):

        rate_limiter.wait()

        try:
            response = session.get(url, timeout=20)
            status = response.status_code
            html = response.text
            size = len(html)

            print(f"[DEBUG] Tentativa {attempt} | Status: {status} | Size: {size}")

            # 🔥 Primeiro valida status HTTP
            if status == 429:
                raise RuntimeError("Rate limit 429")

            response.raise_for_status()

            # 🔥 Detecta bloqueio antifraude
            if is_blocked(html):
                raise RuntimeError("Página de bloqueio detectada")

            # 🔥 Valida layout
            if "ui-search-layout__item" not in html:
                raise RuntimeError("Layout inesperado ou cards não encontrados")

            if size < MIN_HTML_SIZE:
                raise RuntimeError(f"HTML muito pequeno ({size})")

            if size > MAX_HTML_SIZE:
                raise RuntimeError(f"HTML muito grande ({size})")

            # 🔥 Salva debug
            with open(DEBUG_PATH, "w", encoding="utf-8") as f:
                f.write(html)

            backoff.success()
            print("✅ HTML válido capturado")
            return html

        except Exception as e:
            print(f"⚠️ Erro: {e}")
            backoff.error()

            if attempt == MAX_RETRIES:
                raise

            backoff.wait()

    raise RuntimeError("Falha após múltiplas tentativas")
