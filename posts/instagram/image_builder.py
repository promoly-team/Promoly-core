"""Composição das imagens do carrossel.

Gera os slides 1080x1080 de cada post com fundo dark premium desenhado em código
(sem template externo), mantendo identidade visual consistente: badge do tipo no
topo, produto sobre card claro, bloco de preço com ancoragem (de/por) e um slide
final de CTA. Tudo datado em data/instagram/ como promo-{YYYY-MM-DD}-{n}.png.

Texto das imagens NÃO usa emoji (DejaVu não tem glifo colorido). Cores e textos
de marca vêm de posts.instagram.copy.

Requer Pillow (Pillow>=10).
"""
import io
import os
from datetime import date

import requests

from posts.instagram import copy

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "instagram")

CANVAS = 1080
BG_TOP = (13, 14, 20)
BG_BOTTOM = (26, 28, 40)
CARD_COLOR = (255, 255, 255)
PRODUCT_CARD = 620
PRODUCT_SIZE = 540


# =============================================================================
# Util
# =============================================================================
def date_key(d=None):
    return (d or date.today()).strftime("%Y-%m-%d")


def _slide_path(key, idx):
    return os.path.join(OUTPUT_DIR, f"promo-{key}-{idx}.png")


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


def _fit_font(draw, text_value, max_size, max_width, min_size=20):
    """Maior fonte (<= max_size) em que o texto cabe em max_width."""
    size = max_size
    while size > min_size:
        font = _load_font(size)
        if _text_width(draw, text_value, font) <= max_width:
            return font
        size -= 2
    return _load_font(min_size)


def _centered(draw, text_value, y, font, fill, width=CANVAS):
    tw = _text_width(draw, text_value, font)
    draw.text(((width - tw) // 2, y), text_value, fill=fill, font=font)


def _centered_strike(draw, text_value, y, font, fill, width=CANVAS):
    """Texto centralizado com uma linha cortando (preço antigo)."""
    tw = _text_width(draw, text_value, font)
    x = (width - tw) // 2
    draw.text((x, y), text_value, fill=fill, font=font)
    bbox = draw.textbbox((x, y), text_value, font=font)
    mid_y = (bbox[1] + bbox[3]) // 2
    draw.line([(x - 8, mid_y), (x + tw + 8, mid_y)], fill=fill, width=5)


def _wrap(draw, text_value, font, max_width):
    words = text_value.split()
    lines, cur = [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if _text_width(draw, trial, font) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _paragraph(draw, text_value, y, font, fill, max_width, line_gap=18):
    for line in _wrap(draw, text_value, font, max_width):
        _centered(draw, line, y, font, fill)
        y += font.size + line_gap
    return y


# =============================================================================
# Blocos visuais
# =============================================================================
def _canvas(accent=None):
    """Fundo dark com gradiente vertical e brilho sutil da cor de destaque."""
    from PIL import Image, ImageDraw

    # gradiente: coluna 1xH pintada por linha e esticada (rápido)
    grad = Image.new("RGB", (1, CANVAS))
    gpx = grad.load()
    for y in range(CANVAS):
        t = y / CANVAS
        gpx[0, y] = (
            int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t),
            int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t),
            int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t),
        )
    img = grad.resize((CANVAS, CANVAS))

    draw = ImageDraw.Draw(img)
    if accent:
        # faixa fina de destaque no topo (identidade por tipo)
        draw.rectangle([0, 0, CANVAS, 12], fill=accent)
    # moldura sutil
    draw.rounded_rectangle([28, 28, CANVAS - 28, CANVAS - 28],
                           radius=36, outline=(60, 62, 78), width=3)
    return img, draw


def _badge(draw, text_value, accent, y=70):
    font = _load_font(40)
    tw = _text_width(draw, text_value, font)
    pad = 44
    w = tw + 2 * pad
    x0 = (CANVAS - w) // 2
    draw.rounded_rectangle([x0, y, x0 + w, y + 80], radius=40, fill=accent)
    draw.text((x0 + pad, y + 16), text_value, font=font, fill="#FFFFFF")
    return y + 80


def _handle(draw):
    font = _load_font(34)
    _centered(draw, copy.HANDLE, CANVAS - 96, font, copy.MUTED_COLOR)


def _accent_pill(draw, text_value, y, accent):
    font = _fit_font(draw, text_value, 96, CANVAS - 200)
    tw = _text_width(draw, text_value, font)
    pad_x, pad_y = 52, 30
    w = tw + 2 * pad_x
    x0 = (CANVAS - w) // 2
    draw.rounded_rectangle(
        [x0, y, x0 + w, y + font.size + 2 * pad_y], radius=48, fill=accent
    )
    draw.text((x0 + pad_x, y + pad_y), text_value, font=font, fill="#FFFFFF")
    return y + font.size + 2 * pad_y


def _paste_product(canvas, image_url, y=210):
    """Produto sobre um card branco arredondado (contraste no fundo dark)."""
    from PIL import Image, ImageDraw

    resp = requests.get(image_url, timeout=30)
    resp.raise_for_status()
    produto = Image.open(io.BytesIO(resp.content)).convert("RGBA")
    produto = produto.resize((PRODUCT_SIZE, PRODUCT_SIZE))

    card_x = (CANVAS - PRODUCT_CARD) // 2
    overlay = ImageDraw.Draw(canvas)
    overlay.rounded_rectangle(
        [card_x, y, card_x + PRODUCT_CARD, y + PRODUCT_CARD],
        radius=40, fill=CARD_COLOR,
    )
    px = (CANVAS - PRODUCT_SIZE) // 2
    py = y + (PRODUCT_CARD - PRODUCT_SIZE) // 2
    canvas.paste(produto, (px, py), produto)
    return y + PRODUCT_CARD


def _save(canvas, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    canvas.convert("RGB").save(path)
    return path


# =============================================================================
# Slides
# =============================================================================
def _cover_slide(post, path):
    accent = copy.accent_of(post["post_type"])
    canvas, draw = _canvas(accent)
    _badge(draw, copy.badge_of(post["post_type"]), accent)
    bottom = _paste_product(canvas, post["imagem_url"], y=210)
    titulo = copy.short_title(post["titulo"], 52)
    font = _fit_font(draw, titulo, 56, CANVAS - 160)
    _centered(draw, titulo, bottom + 44, font, copy.TEXT_COLOR)
    _handle(draw)
    return _save(canvas, path)


def _price_slide(post, path):
    tipo = post["post_type"]
    accent = copy.accent_of(tipo)
    canvas, draw = _canvas(accent)
    y = 280

    if tipo == copy.PRICE_DROP:
        font_de = _load_font(64)
        _centered_strike(draw, f"De {copy.brl(post['preco_anterior'])}",
                         y, font_de, copy.MUTED_COLOR)
        y += 124

    _centered(draw, "POR APENAS", y, _load_font(48), copy.MUTED_COLOR)
    y += 78

    por = copy.brl(post["preco_atual"])
    font_por = _fit_font(draw, por, 180, CANVAS - 140)
    _centered(draw, por, y, font_por, copy.PRICE_COLOR)
    y += font_por.size + 56

    if tipo == copy.PRICE_DROP:
        economia = post["preco_anterior"] - post["preco_atual"]
        ctx = f"-{post['desconto_pct']:.0f}%   economia de {copy.brl(economia)}"
    elif tipo == copy.ALL_TIME_LOW:
        ctx = f"Menor preço em {post['total_registros']} medições"
    else:
        ctx = f"Média histórica: {copy.brl(post['avg_price'])}"
    font_ctx = _fit_font(draw, ctx, 52, CANVAS - 140)
    _centered(draw, ctx, y, font_ctx, accent)

    _handle(draw)
    return _save(canvas, path)


def _cta_slide(post, path):
    accent = copy.accent_of(post["post_type"])
    canvas, draw = _canvas(accent)

    font_top = _fit_font(draw, "GARANTA O SEU", 92, CANVAS - 140)
    _centered(draw, "GARANTA O SEU", 320, font_top, copy.TEXT_COLOR)

    _accent_pill(draw, "LINK NA BIO", 470, accent)

    urg = copy.pick(copy.URGENCIA)
    font_urg = _fit_font(draw, urg, 50, CANVAS - 180)
    _centered(draw, urg, 720, font_urg, copy.MUTED_COLOR)

    _handle(draw)
    return _save(canvas, path)


def _edu_slides(post, key):
    accent = copy.accent_of(copy.EDUCATIONAL)
    paths = []

    canvas, draw = _canvas(accent)
    _badge(draw, copy.badge_of(copy.EDUCATIONAL), accent)
    font_t = _fit_font(draw, post["titulo"], 72, CANVAS - 160)
    _centered(draw, post["titulo"], 300, font_t, copy.TEXT_COLOR)
    _paragraph(draw, post["corpo"], 470, _load_font(48),
               copy.MUTED_COLOR, CANVAS - 200)
    _handle(draw)
    paths.append(_save(canvas, _slide_path(key, 1)))

    canvas, draw = _canvas(accent)
    _centered(draw, "SIGA PRA", 360, _fit_font(draw, "SIGA PRA", 92, CANVAS - 140),
              copy.TEXT_COLOR)
    _accent_pill(draw, "ECONOMIZAR", 500, accent)
    _handle(draw)
    paths.append(_save(canvas, _slide_path(key, 2)))

    return paths


# =============================================================================
# API pública
# =============================================================================
def build_slides(post, key=None):
    """Compõe os slides do carrossel e devolve a lista de caminhos (em ordem)."""
    key = key or date_key()

    if post["post_type"] == copy.EDUCATIONAL:
        return _edu_slides(post, key)

    return [
        _cover_slide(post, _slide_path(key, 1)),
        _price_slide(post, _slide_path(key, 2)),
        _cta_slide(post, _slide_path(key, 3)),
    ]


def write_caption(caption, key=None):
    """Salva a legenda em arquivo datado. Retorna o caminho."""
    key = key or date_key()
    out_path = os.path.join(OUTPUT_DIR, f"promo-{key}.txt")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(caption)
    return out_path
