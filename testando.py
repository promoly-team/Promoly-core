import requests

print("🚀 Teste API Mercado Livre")

url = "https://api.mercadolibre.com/sites/MLB/search"

params = {
    "q": "fone bluetooth",
    "limit": 5,
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "pt-BR,pt;q=0.9",
    "Referer": "https://www.mercadolivre.com.br/",
    "Origin": "https://www.mercadolivre.com.br",
}

r = requests.get(url, params=params, headers=HEADERS, timeout=15)

print("Status:", r.status_code)
print("Content-Type:", r.headers.get("content-type"))
print("Body:", r.text[:300])

if r.status_code == 200:
    data = r.json()
    print("Total:", data["paging"]["total"])
    print("Primeiro produto:", data["results"][0]["title"])
else:
    print("❌ Erro retornado:", r.json())
