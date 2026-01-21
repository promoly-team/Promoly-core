import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
import json
from config import WAHA_API_KEY, WAHA_SENDER, WAHA_TARGET, URL


# =============================
# FEATURE FLAGS
# =============================
FILTER_LAST_5_HOURS = True
HOURS_LIMIT = 5

# =============================
# CONFIG
# =============================
URL = "https://www.vintepila.com.br/trabalhos-freelance"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"
}

MESES_PT = {
    "janeiro": 1,
    "fevereiro": 2,
    "março": 3,
    "abril": 4,
    "maio": 5,
    "junho": 6,
    "julho": 7,
    "agosto": 8,
    "setembro": 9,
    "outubro": 10,
    "novembro": 11,
    "dezembro": 12,
}

# =============================
# REQUEST
# =============================
def scrape_vintepila():
    response = requests.get(URL, headers=HEADERS)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    cards = soup.select("div.item")

    now = datetime.now()
    time_limit = now - timedelta(hours=HOURS_LIMIT)

    results = []

    # =============================
    # PARSE
    # =============================
    for card in cards:
        title_tag = card.select_one("a.header")
        if not title_tag:
            continue

        title = title_tag.get_text(strip=True)
        link = title_tag["href"]

        price_tag = card.select_one("span#project-price")
        price_range = price_tag.get_text(strip=True) if price_tag else None

        desc_tag = card.select_one("div.description p")
        description = desc_tag.get_text(strip=True) if desc_tag else None

        deadline = None
        published_at = None

        for span in card.select("div.extra span"):
            # prazo
            if span.find("i", class_="truck"):
                deadline = span.get_text(strip=True)

            # data publicação
            if span.find("i", class_="world"):
                text = span.get_text(strip=True).lower()

                # exemplo: "16 janeiro às 18:39"
                match = re.search(r"(\d{1,2})\s+(\w+)\s+às\s+(\d{2}):(\d{2})", text)
                if match:
                    day = int(match.group(1))
                    month = MESES_PT.get(match.group(2))
                    hour = int(match.group(3))
                    minute = int(match.group(4))

                    if month:
                        published_at = datetime(
                            year=now.year,
                            month=month,
                            day=day,
                            hour=hour,
                            minute=minute
                        )

        # =============================
        # FEATURE FLAG
        # =============================
        if FILTER_LAST_5_HOURS:
            if not published_at or published_at < time_limit:
                continue

        results.append({
            "titulo": title,
            "link": link,
            "descricao": description,
            "faixa_valor": price_range,
            "prazo_entrega": deadline,
            "publicado_em": published_at.strftime("%Y-%m-%d %H:%M") if published_at else None
        })
    return results


def send_whatsapp(pedidos):
    if not pedidos:
        return

    # formata mensagem
    body = "Pedidos nas últimas 5 horas:\n"
    for p in pedidos:
        body += f"{p['titulo']} — {p['faixa_valor']} — {p['link']}\n\n"

    url = "https://api.waha.devlike.com/v1/messages"
    headers = {
        "Authorization": f"Bearer {WAHA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": WAHA_SENDER,
        "to": WAHA_TARGET,
        "type": "text",
        "text": {"body": body}
    }

    r = requests.post(url, headers=headers, json=payload)
    print("WhatsApp sent:", r.status_code, r.text)



if __name__ == "__main__":
    pedidos = scrape_vintepila()
    send_whatsapp(pedidos)