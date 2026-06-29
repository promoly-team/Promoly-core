from dotenv import load_dotenv
import os
load_dotenv()
URL_MLB_BASE = os.getenv("URL_MLB_BASE")

import random

# Pool de User-Agents para rotação — fingerprint estático único é fácil de
# bloquear em escala. A cada request escolhe-se um UA aleatório.
USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
]

# Headers base (sem User-Agent, que é injetado por request via build_headers).
BASE_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


def build_headers() -> dict:
    """Monta headers com um User-Agent aleatório do pool."""
    return {**BASE_HEADERS, "User-Agent": random.choice(USER_AGENTS)}


# Compat: HEADERS continua disponível (UA fixo do pool) para quem importa.
HEADERS = {**BASE_HEADERS, "User-Agent": USER_AGENTS[0]}


CATEGORIES = {
    # =========================
    # ELETRÔNICOS
    # =========================
    "eletronicos": [
        "fone bluetooth",
        "smartwatch",
        "power bank",
        "carregador usb c",
        "caixa de som bluetooth",
        "lâmpada smart",
        "tomada inteligente",
        "câmera wi-fi",
        "repetidor wifi",
        "mini projetor",
        "hub usb",
        "adaptador usb c",
    ],

    # =========================
    # CASA
    # =========================
    "casa": [
        "organizador multiuso",
        "organizador de gaveta",
        "porta temperos",
        "prateleira decorativa",
        "lixeira automática",
        "tapete antiderrapante",
        "escorredor de louça",
        "organizador de geladeira",
        "cortina blackout",
        "iluminação led decorativa",
    ],

    # =========================
    # PET
    # =========================
    "pet": [
        "comedouro automático",
        "bebedouro pet",
        "fonte de água para gatos",
        "arranhador para gato",
        "brinquedo interativo pet",
        "cama para cachorro",
        "tapete higiênico pet",
        "escova removedora de pelos",
        "transportadora pet",
    ],

    # =========================
    # INFORMÁTICA
    # =========================
    "informatica": [
        "mouse sem fio",
        "teclado bluetooth",
        "teclado mecânico",
        "monitor",
        "suporte para notebook",
        "cooler para notebook",
        "webcam",
        "hub usb",
        "mochila para notebook",
    ],

    # =========================
    # GAMES
    # =========================
    "games": [
        "controle xbox",
        "controle ps4",
        "controle ps5",
        "headset gamer",
        "mouse gamer",
        "teclado gamer",
        "cadeira gamer",
        "suporte para controle",
    ],

    # =========================
    # ILUMINAÇÃO
    # =========================
    "iluminacao": [
        "lâmpada led",
        "fita led rgb",
        "luminária de mesa",
        "luminária de chão",
        "abajur",
        "plafon led",
        "luz noturna",
    ],

    # =========================
    # LIMPEZA & ORGANIZAÇÃO
    # =========================
    "limpeza": [
        "aspirador portátil",
        "mop giratório",
        "organizador multiuso",
        "escova elétrica limpeza",
        "dispenser automático",
        "caixa organizadora",
        "pano de microfibra",
    ],

    # =========================
    # FITNESS & SAÚDE
    # =========================
    "fitness": [
        "halter",
        "kit elástico exercício",
        "colchonete",
        "balança digital",
        "massageador elétrico",
        "pistola massageadora",
        "smartwatch fitness",
    ],

    # =========================
    # AUTOMOTIVO
    # =========================
    "automotivo": [
        "suporte celular carro",
        "carregador veicular",
        "aspirador automotivo",
        "câmera veicular",
        "organizador de porta malas",
        "capa de banco",
        "inflador portátil",
    ],
}