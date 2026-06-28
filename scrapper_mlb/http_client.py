import hashlib
import os
import random
import threading
import time
from pathlib import Path

import requests

from scrapper_mlb.config import HEADERS, build_headers


# Diretório de debug; cada URL gera um arquivo único para evitar corrida de
# escrita entre as threads do ThreadPoolExecutor. Só grava se habilitado.
DEBUG_DIR = Path("debug_html")
DEBUG_ENABLED = os.getenv("SCRAPER_DEBUG_HTML", "").lower() in ("1", "true", "yes")
_debug_lock = threading.Lock()

MIN_HTML_SIZE = 50_000
MAX_HTML_SIZE = 5_000_000
MAX_RETRIES = 3


def _save_debug(url: str, html: str) -> None:
    if not DEBUG_ENABLED:
        return
    nome = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
    with _debug_lock:
        DEBUG_DIR.mkdir(exist_ok=True)
        (DEBUG_DIR / f"{nome}.html").write_text(html, encoding="utf-8")


class BackoffController:
    def __init__(self, base_delay=2.0, max_delay=30.0, factor=2.0):
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.factor = factor
        self.current_delay = base_delay
        self._lock = threading.Lock()

    def success(self):
        with self._lock:
            self.current_delay = self.base_delay

    def error(self):
        with self._lock:
            self.current_delay = min(self.current_delay * self.factor, self.max_delay)

    def wait(self):
        with self._lock:
            delay = random.uniform(self.current_delay * 0.8, self.current_delay * 1.2)
        time.sleep(delay)


class RateLimiter:
    def __init__(self, min_interval: float):
        self.min_interval = min_interval
        self.last_request = 0.0
        self._lock = threading.Lock()

    def wait(self):
        # Serializa as threads: mantém o lock durante o sleep para que o
        # intervalo mínimo seja respeitado globalmente, não por thread.
        with self._lock:
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
            # 🔄 User-Agent rotacionado por request (rotação de fingerprint)
            response = session.get(url, timeout=20, headers=build_headers())
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

            # 🔥 Salva debug (arquivo único por URL, sem corrida entre threads)
            _save_debug(url, html)

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
