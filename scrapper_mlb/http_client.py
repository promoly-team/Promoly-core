import random
import time
from pathlib import Path

import requests

from scrapper_mlb.config import HEADERS



#DEBUG_PATH = Path("/tmp/scrapper_mlb_debug.html")

MIN_HTML_SIZE = 50_000       # 50 KB
MAX_HTML_SIZE = 5_000_000   # 5 MB


class BackoffController:
    def __init__(
        self,
        base_delay=1.5,
        max_delay=30.0,
        factor=2.0,
        jitter=True,
    ):
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.factor = factor
        self.jitter = jitter
        self.current_delay = base_delay

    def success(self):
        self.current_delay = self.base_delay

    def error(self):
        self.current_delay = min(
            self.current_delay * self.factor,
            self.max_delay
        )

    def wait(self):
        delay = self.current_delay
        if self.jitter:
            delay = random.uniform(delay * 0.7, delay * 1.3)
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

rate_limiter = RateLimiter(min_interval=3.5)
backoff = BackoffController()


backoff = BackoffController()
rate_limiter = RateLimiter(min_interval=1.5) 



def is_silent_block(html: str) -> bool:
    markers = [
        "captcha",
        "verify you are human",
        "access denied",
        "unusual traffic",
        "robot",
    ]

    html_lower = html.lower()
    return any(marker in html_lower for marker in markers)



def fetch_html(url: str) -> str:
    rate_limiter.wait()  # pode remover se quiser só backoff

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)

        html = response.text
        size = len(html)

        '''if is_silent_block(html):
            raise RuntimeError("Bloqueio silencioso detectado")'''

        if "ui-search-layout__item" not in html:
            raise RuntimeError("HTML sem cards — bloqueio")

        if size < MIN_HTML_SIZE:
            raise RuntimeError(f"HTML muito pequeno ({size} bytes) — possível bloqueio")

        if size > MAX_HTML_SIZE:
            raise RuntimeError(f"HTML muito grande ({size} bytes) — layout inesperado")


        if response.status_code == 429:
            backoff.error()
            raise RuntimeError("⚠️ Rate limit 429")

        response.raise_for_status()

        backoff.success()

       #print(f"[DEBUG] Status: {response.status_code}")
        #print(f"[DEBUG] HTML size: {len(response.text)}")

        #with open(DEBUG_PATH, "w", encoding="utf-8") as f:
        #   f.write(response.text)

        return response.text

    except requests.RequestException:
        backoff.error()
        raise

    finally:
        backoff.wait()
