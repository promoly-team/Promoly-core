from dotenv import load_dotenv
import os
load_dotenv()
URL_MLB_BASE = os.getenv("URL_MLB_BASE")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64)"
}



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