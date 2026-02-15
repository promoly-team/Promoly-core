from decimal import Decimal
import json
import re


def extract_page_price(soup):

    html = str(soup)

    # 🔥 1️⃣ Busca bloco principal do PDP (state VISIBLE)
    match = re.search(
        r'"price"\s*:\s*{[^}]*"state"\s*:\s*"VISIBLE"[^}]*"value"\s*:\s*([\d.]+)',
        html
    )

    if match:
        try:
            return Decimal(match.group(1))
        except:
            pass

    # 🔥 2️⃣ Fallback: JSON-LD estruturado
    scripts = soup.find_all("script", type="application/ld+json")

    for script in scripts:
        try:
            data = json.loads(script.string)
            if isinstance(data, dict) and "offers" in data:
                price = data["offers"].get("price")
                if price:
                    return Decimal(str(price))
        except:
            continue

    return None
