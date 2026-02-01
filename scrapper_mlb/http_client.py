import time
import requests
from pathlib import Path
from scrapper_mlb.config import HEADERS

DEBUG_PATH = Path("/tmp/scrapper_mlb_debug.html")


def fetch_html(url: str) -> str:

    time.sleep(5)
    response = requests.get(url, headers=HEADERS, timeout=15)

    if response.status_code == 429:
        raise RuntimeError("⚠️ Rate limit do Mercado Livre (429)")

    response.raise_for_status()
    
    print(f"[DEBUG] Status: {response.status_code}")
    print(f"[DEBUG] HTML size: {len(response.text)}")

    # grava debug em local sempre gravável
    with open(DEBUG_PATH, "w", encoding="utf-8") as f:
        f.write(response.text)

    return response.text
