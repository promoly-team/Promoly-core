"""Pipeline de postagem no Instagram.

  generate -> escolhe o post do dia (InstagramContentService), compõe os slides
              do carrossel + a legenda, datados em data/instagram/.
  post     -> lê os slides do dia e publica (carrossel; single se houver 1 só).
  all      -> generate + post.

A Graph API baixa cada imagem pela URL pública, então data/instagram/ precisa ser
servido sob SITE_BASE_URL.

Uso:
    python -m posts.instagram.main generate
    python -m posts.instagram.main post
    python -m posts.instagram.main all   (default)
"""
import glob
import os
import re
import sys
from datetime import date

from database.db import SessionLocal
from posts.instagram.content_service import InstagramContentService
from posts.instagram.image_builder import build_slides, write_caption
from posts.instagram.publisher import publish_carousel, publish_single, require_env

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "instagram")


def date_key(d=None):
    return (d or date.today()).strftime("%Y-%m-%d")


def _slide_index(path):
    m = re.search(r"-(\d+)\.png$", path)
    return int(m.group(1)) if m else 0


def generate_today():
    """Gera slides + legenda do dia. Retorna o post dict."""
    db = SessionLocal()
    try:
        post = InstagramContentService(db).generate_daily_post()
    finally:
        db.close()

    if not post:
        raise RuntimeError("Nenhuma oferta elegível para gerar post hoje.")

    slides = build_slides(post)
    caption_path = write_caption(post["caption"])

    print(f"Tipo: {post['post_type']} | Slides: {len(slides)}")
    for p in slides:
        print(f"  slide: {p}")
    print(f"Legenda gerada: {caption_path}")
    return post


def publish_today():
    """Lê os slides do dia e publica no feed."""
    env = require_env()
    base_url = env["base_url"].rstrip("/")
    key = date_key()

    slides = sorted(
        glob.glob(os.path.join(OUTPUT_DIR, f"promo-{key}-*.png")),
        key=_slide_index,
    )
    caption_path = os.path.join(OUTPUT_DIR, f"promo-{key}.txt")

    if not slides or not os.path.exists(caption_path):
        raise FileNotFoundError(
            f"Slides/legenda do dia não encontrados em {OUTPUT_DIR}. "
            "Rode 'generate' antes de postar."
        )

    with open(caption_path, encoding="utf-8") as fh:
        caption = fh.read()

    urls = [f"{base_url}/instagram/{os.path.basename(p)}" for p in slides]

    if len(urls) == 1:
        return publish_single(urls[0], caption)
    return publish_carousel(urls, caption)


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
