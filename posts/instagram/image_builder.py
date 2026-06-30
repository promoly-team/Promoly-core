"""Composição da imagem do post.

Refatora gerador_posts/main.py: em vez de ler arquivos locais fixos, baixa a
imagem do produto pela URL, cola centralizada sobre o template e escreve título
e preço. Salva o PNG datado em data/instagram/.

Requer Pillow (Pillow>=10). Background removal (rembg) é opcional e não é usado
aqui para manter as dependências leves.
"""
import io
import os
from datetime import date

import requests

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "instagram")
TEMPLATE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "gerador_posts", "template.png"
)

PRODUCT_SIZE = (400, 400)


def date_key(d=None):
    return (d or date.today()).strftime("%Y-%m-%d")


def _load_font(size):
    from PIL import ImageFont

    for name in ("DejaVuSans-Bold.ttf", "arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _text_width(draw, text_value, font):
    bbox = draw.textbbox((0, 0), text_value, font=font)
    return bbox[2] - bbox[0]


def _fit_font(draw, text_value, max_size, max_width, min_size=18):
    """Maior fonte (<= max_size) em que o texto cabe em max_width."""
    size = max_size
    while size > min_size:
        font = _load_font(size)
        if _text_width(draw, text_value, font) <= max_width:
            return font
        size -= 2
    return _load_font(min_size)


def _draw_centered(draw, text_value, y, font, fill, width):
    text_width = _text_width(draw, text_value, font)
    x = (width - text_width) // 2
    draw.text((x, y), text_value, fill=fill, font=font)


def build_post_image(image_url, titulo, preco, out_path=None):
    """Compõe a imagem do post e salva. Retorna o caminho do arquivo gerado."""
    from PIL import Image, ImageDraw

    if out_path is None:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        out_path = os.path.join(OUTPUT_DIR, f"promo-{date_key()}.png")

    fundo = Image.open(TEMPLATE_PATH).convert("RGBA")
    draw = ImageDraw.Draw(fundo)

    resp = requests.get(image_url, timeout=30)
    resp.raise_for_status()
    produto = Image.open(io.BytesIO(resp.content)).convert("RGBA")
    produto = produto.resize(PRODUCT_SIZE)

    x_produto = (fundo.width - produto.width) // 2
    y_produto = (fundo.height - produto.height) // 2
    fundo.paste(produto, (x_produto, y_produto), produto)

    margin = 60
    max_text_width = fundo.width - 2 * margin

    titulo_curto = titulo if len(titulo) <= 45 else titulo[:45].rsplit(" ", 1)[0]
    titulo_font = _fit_font(draw, titulo_curto, max_size=40, max_width=max_text_width)
    y_titulo = y_produto + produto.height + 20
    _draw_centered(draw, titulo_curto, y_titulo, titulo_font, "white", fundo.width)

    preco_txt = f"R$ {preco:.2f}".replace(".", ",")
    preco_font = _fit_font(draw, preco_txt, max_size=52, max_width=max_text_width)
    _draw_centered(draw, preco_txt, y_titulo + 55, preco_font, "yellow", fundo.width)

    fundo.convert("RGB").save(out_path)
    return out_path


def write_caption(caption, out_path=None):
    """Salva a legenda em arquivo datado. Retorna o caminho."""
    if out_path is None:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        out_path = os.path.join(OUTPUT_DIR, f"promo-{date_key()}.txt")

    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(caption)
    return out_path
