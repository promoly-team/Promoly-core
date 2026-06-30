"""Pipeline de postagem no Instagram.

Espelha o fluxo do projeto religious (generate-* -> post-instagram), mas em
Python e ligado ao banco do Promoly:

  generate -> escolhe a oferta do dia (InstagramContentService), baixa a imagem
              do produto e compõe o PNG + legenda datados em data/instagram/.
  post     -> lê os assets do dia e publica no feed via Graph API.
  all      -> generate + post.

A Graph API baixa a imagem pela URL pública, então data/instagram/ precisa ser
servido sob SITE_BASE_URL.

Uso:
    python -m posts.instagram.main generate
    python -m posts.instagram.main post
    python -m posts.instagram.main all   (default)
"""
import os
import sys
from datetime import date

from database.db import SessionLocal
from posts.instagram.content_service import InstagramContentService
from posts.instagram.image_builder import build_post_image, write_caption
from posts.instagram.publisher import publish_single, require_env

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "instagram")


def date_key(d=None):
    return (d or date.today()).strftime("%Y-%m-%d")


def generate_today():
    """Gera imagem + legenda do dia a partir da melhor oferta. Retorna o post dict."""
    db = SessionLocal()
    try:
        post = InstagramContentService(db).generate_daily_post()
    finally:
        db.close()

    if not post:
        raise RuntimeError("Nenhuma oferta elegível para gerar post hoje.")
    if not post.get("imagem_url"):
        raise RuntimeError(f"Oferta {post['produto_id']} sem imagem_url.")

    image_path = build_post_image(
        post["imagem_url"], post["titulo"], post["preco_atual"]
    )
    caption_path = write_caption(post["caption"])

    print(f"Imagem gerada: {image_path}")
    print(f"Legenda gerada: {caption_path}")
    return post


def publish_today():
    """Lê os assets do dia e publica no feed."""
    env = require_env()
    base_url = env["base_url"].rstrip("/")

    key = date_key()
    image_path = os.path.join(OUTPUT_DIR, f"promo-{key}.png")
    caption_path = os.path.join(OUTPUT_DIR, f"promo-{key}.txt")

    if not os.path.exists(image_path) or not os.path.exists(caption_path):
        raise FileNotFoundError(
            f"Imagem/legenda do dia não encontradas em {OUTPUT_DIR}. "
            "Rode 'generate' antes de postar."
        )

    with open(caption_path, encoding="utf-8") as fh:
        caption = fh.read()

    image_url = f"{base_url}/instagram/promo-{key}.png"
    return publish_single(image_url, caption)


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"

    if cmd == "generate":
        generate_today()
    elif cmd == "post":
        publish_today()
    elif cmd == "all":
        generate_today()
        publish_today()
    else:
        print(f"Comando desconhecido: {cmd} (use generate|post|all)", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    try:
        main()
    except Exception as err:  # noqa: BLE001 - espelha o catch do script original
        print(err, file=sys.stderr)
        sys.exit(1)
