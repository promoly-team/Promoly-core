"""Cliente fino da Instagram Graph API.

Porte direto de scripts/lib/graph-api.js do projeto religious: centraliza a
chamada HTTP e o polling de status da mídia até ficar pronta para publicar.
"""
import time

import requests

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE = "https://graph.instagram.com"


def graph_request(method, endpoint, params):
    """Faz uma chamada à Graph API. GET manda os params na query, o resto no body."""
    url = f"{GRAPH_API_BASE}/{GRAPH_API_VERSION}/{endpoint}"

    if method.upper() == "GET":
        response = requests.get(url, params=params)
    else:
        response = requests.request(
            method,
            url,
            data=params,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    try:
        parsed = response.json()
    except ValueError:
        parsed = {"raw": response.text}

    if response.status_code >= 400:
        raise RuntimeError(
            f"Graph API error ({response.status_code}): {parsed}"
        )

    return parsed


def wait_until_ready(media_id, access_token, attempts=15, interval_s=4):
    """Aguarda o container de mídia terminar o processamento (status FINISHED)."""
    for _ in range(attempts):
        status = graph_request(
            "GET",
            media_id,
            {"fields": "status_code", "access_token": access_token},
        )
        code = status.get("status_code")
        if code == "FINISHED":
            return
        if code == "ERROR":
            raise RuntimeError(f"Processamento da mídia falhou: {status}")
        time.sleep(interval_s)

    raise TimeoutError("Tempo esgotado esperando a mídia ficar pronta.")
