"""Helpers de publicação no Instagram.

Porte de scripts/lib/publish.js do projeto religious. Centraliza o fluxo
repetido de "criar container -> (montar carrossel) -> esperar processar ->
publicar", para feed (single/carrossel) e stories.
"""
import os

from dotenv import load_dotenv

from posts.instagram.graph_api import graph_request, wait_until_ready

load_dotenv()


def require_env():
    """Valida e retorna as variáveis obrigatórias da Graph API."""
    token = os.getenv("IG_ACCESS_TOKEN")
    user_id = os.getenv("IG_USER_ID")
    base_url = os.getenv("SITE_BASE_URL")

    if not token or not user_id or not base_url:
        raise RuntimeError(
            "Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL"
        )

    return {"token": token, "user_id": user_id, "base_url": base_url}


def publish_carousel(image_urls, caption):
    """Publica um carrossel a partir de uma lista de URLs de imagem."""
    env = require_env()
    token, user_id = env["token"], env["user_id"]
    child_ids = []

    for i, image_url in enumerate(image_urls):
        print(f"Criando item {i + 1}: {image_url}")
        item = graph_request(
            "POST",
            f"{user_id}/media",
            {
                "image_url": image_url,
                "is_carousel_item": "true",
                "access_token": token,
            },
        )
        child_ids.append(item["id"])

    print("Criando carrossel...")
    carousel = graph_request(
        "POST",
        f"{user_id}/media",
        {
            "media_type": "CAROUSEL",
            "caption": caption,
            "children": ",".join(child_ids),
            "access_token": token,
        },
    )

    return _publish(carousel["id"], token, user_id, label="Carrossel")


def publish_single(image_url, caption):
    """Publica uma imagem única no feed (foto + legenda)."""
    env = require_env()
    token, user_id = env["token"], env["user_id"]

    print(f"Criando publicação: {image_url}")
    created = graph_request(
        "POST",
        f"{user_id}/media",
        {"image_url": image_url, "caption": caption, "access_token": token},
    )

    return _publish(created["id"], token, user_id, label="Publicação")


def publish_story(image_url):
    """Publica uma imagem como story."""
    env = require_env()
    token, user_id = env["token"], env["user_id"]

    print(f"Criando story: {image_url}")
    created = graph_request(
        "POST",
        f"{user_id}/media",
        {"image_url": image_url, "media_type": "STORIES", "access_token": token},
    )

    return _publish(created["id"], token, user_id, label="Story")


def _publish(creation_id, token, user_id, label):
    """Espera o container processar e dispara o media_publish."""
    print(f"{label} criado: {creation_id}")
    print("Aguardando processamento...")
    wait_until_ready(creation_id, token)

    print("Publicando...")
    published = graph_request(
        "POST",
        f"{user_id}/media_publish",
        {"creation_id": creation_id, "access_token": token},
    )

    post_id = published["id"]
    print(f"Publicado com sucesso! Post ID: {post_id}")
    return post_id
