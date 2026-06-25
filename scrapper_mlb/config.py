from dotenv import load_dotenv
import os
load_dotenv()
URL_MLB_BASE = os.getenv("URL_MLB_BASE")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}
CATEGORIES = {
    "informatica": {
        "computadores": {
            "notebook": {
                "query": "notebook",
                "min_price": 1500,
                "max_price": 15000,
                "max_pages": 1,
            },
            "ultrabook": {
                "query": "ultrabook",
                "min_price": 2500,
                "max_price": 12000,
                "max_pages": 1,
            },
            "macbook": {
                "query": "macbook",
                "min_price": 6000,
                "max_price": 25000,
                "max_pages": 1,
            },
            "desktop": {
                "query": "desktop",
                "min_price": 1200,
                "max_price": 20000,
                "max_pages": 1,
            },
        },

        "componentes": {
            "processador": {
                "query": "processador",
                "min_price": 300,
                "max_price": 10000,
                "max_pages": 1,
            },
            "placa_de_video": {
                "query": "placa de video",
                "min_price": 800,
                "max_price": 20000,
                "max_pages": 1,
            },
            "ssd": {
                "query": "ssd",
                "min_price": 100,
                "max_price": 5000,
                "max_pages": 1,
            },
        },
    },

    "eletronicos": {
        "smartphones": {
            "smartphone_android": {
                "query": "smartphone android",
                "min_price": 500,
                "max_price": 12000,
                "max_pages": 1,
            },
            "iphone": {
                "query": "iphone",
                "min_price": 2000,
                "max_price": 15000,
                "max_pages": 1,
            },
        },

        "tv_video": {
            "smart_tv": {
                "query": "smart tv",
                "min_price": 1200,
                "max_price": 20000,
                "max_pages": 1,
            },
            "projetor": {
                "query": "projetor",
                "min_price": 800,
                "max_price": 15000,
                "max_pages": 1,
            },
        },
    },
}