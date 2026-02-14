# scrapper_mlb/pricing/query_rules.py


def get_price_range_by_query(query: str):
    q = query.lower()

    # =========================
    # ELETRÔNICOS
    # =========================
    if "smartwatch" in q:
        return (120, 2000)

    if "mini projetor" in q:
        return (300, 3000)

    if "câmera wi-fi" in q:
        return (120, 1200)

    if "fone bluetooth" in q:
        return (80, 1200)

    if "power bank" in q:
        return (60, 500)

    if "caixa de som bluetooth" in q:
        return (100, 2000)

    # =========================
    # INFORMÁTICA
    # =========================
    if "monitor" in q:
        return (500, 4000)

    if "teclado mecânico" in q:
        return (150, 1200)

    if "webcam" in q:
        return (120, 1500)

    # =========================
    # GAMES
    # =========================
    if "controle xbox" in q or "controle ps4" in q or "controle ps5" in q:
        return (150, 600)

    if "cadeira gamer" in q:
        return (600, 4000)

    if "headset gamer" in q:
        return (150, 2000)

    if "mouse gamer" in q:
        return (100, 1500)

    if "teclado gamer" in q:
        return (150, 2000)

    # =========================
    # CASA
    # =========================
    if "lixeira automática" in q:
        return (150, 1200)

    if "cortina blackout" in q:
        return (120, 800)

    # =========================
    # PET
    # =========================
    if "comedouro automático" in q:
        return (150, 1000)

    if "fonte de água" in q:
        return (120, 800)

    # =========================
    # FITNESS
    # =========================
    if "pistola massageadora" in q:
        return (250, 2000)

    if "halter" in q:
        return (80, 800)

    # =========================
    # AUTOMOTIVO
    # =========================
    if "câmera veicular" in q:
        return (150, 1500)

    if "inflador portátil" in q:
        return (120, 1200)

    # fallback
    return None
