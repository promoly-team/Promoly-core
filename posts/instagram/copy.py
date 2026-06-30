"""Copywriting e identidade visual dos posts do Instagram.

Concentra a parte de "marketing" da automação: tipos de post, rotação semanal,
gatilhos de conversão (ancoragem, urgência, escassez, prova social), legendas e
a paleta de cores das imagens. Mantém content_service (dados) e image_builder
(desenho) enxutos e sem texto solto espalhado.

Regra de ouro: emoji só na LEGENDA (o Instagram renderiza). Nas IMAGENS não use
emoji — as fontes do sistema (DejaVu) não têm glifo colorido e sai um quadrado.
"""
from __future__ import annotations

import random
from datetime import date

# =============================================================================
# Tipos de post
# =============================================================================
PRICE_DROP = "price_drop"        # caiu vs o preço anterior
ALL_TIME_LOW = "all_time_low"    # menor valor de toda a série
BELOW_AVERAGE = "below_average"  # abaixo da média histórica
EDUCATIONAL = "educational"      # sem produto: aquece a audiência

# Rotação semanal determinística (weekday: segunda=0 ... domingo=6).
# Produto nos dias úteis (gatilho de compra), educativo no domingo (engajamento).
WEEKLY_ROTATION = {
    0: PRICE_DROP,
    1: ALL_TIME_LOW,
    2: BELOW_AVERAGE,
    3: PRICE_DROP,
    4: ALL_TIME_LOW,
    5: BELOW_AVERAGE,
    6: EDUCATIONAL,
}


def post_type_for(d: date | None = None) -> str:
    return WEEKLY_ROTATION[(d or date.today()).weekday()]


# =============================================================================
# Marca / paleta (cores em hex, aceitas direto pelo Pillow)
# =============================================================================
HANDLE = "@promoly__"
BRAND = "Promoly"

PRICE_COLOR = "#FFD400"   # amarelo: sempre o preço final
TEXT_COLOR = "#FFFFFF"
MUTED_COLOR = "#9AA0A6"   # cinza: preço antigo / contexto secundário

PALETTE = {
    PRICE_DROP:    {"accent": "#FF3B30", "badge": "QUEDA DE PREÇO"},
    ALL_TIME_LOW:  {"accent": "#AF52DE", "badge": "MENOR PREÇO DA HISTÓRIA"},
    BELOW_AVERAGE: {"accent": "#34C759", "badge": "ABAIXO DA MÉDIA"},
    EDUCATIONAL:   {"accent": "#FFD400", "badge": "DICA PROMOLY"},
}


def accent_of(post_type: str) -> str:
    return PALETTE.get(post_type, PALETTE[PRICE_DROP])["accent"]


def badge_of(post_type: str) -> str:
    return PALETTE.get(post_type, PALETTE[PRICE_DROP])["badge"]


# =============================================================================
# Emojis (somente legenda)
# =============================================================================
EMOJIS_ALERTA = ["⚠️", "🚨", "🔔"]
EMOJIS_QUEDA = ["📉", "⬇️", "🔻"]
EMOJIS_PRECO = ["💰", "💵", "💲"]
EMOJIS_FOGO = ["🔥", "💥", "⚡"]

CTA_LINES = [
    "👉 Link na bio pra garantir o seu",
    "👉 Corre que tá no link da bio",
    "👉 Garante o seu pelo link da bio",
]
URGENCIA = [
    "Se subir, não volta nesse valor.",
    "Nesse preço o estoque some rápido.",
    "Promoção pode acabar a qualquer momento.",
]


# =============================================================================
# Helpers de formatação
# =============================================================================
def brl(value) -> str:
    return f"R$ {float(value):.2f}".replace(".", ",")


def pick(pool):
    return random.choice(pool)


def _slug_tag(value: str) -> str:
    return value.replace(" ", "").replace("-", "").lower()


def hashtags(categoria, subcategoria, post_type) -> str:
    tags = ["#promoção", "#desconto", "#ofertas", "#economia", "#achados"]
    if post_type in (ALL_TIME_LOW, BELOW_AVERAGE):
        tags.append("#menorpreço")
    if categoria:
        tags.append("#" + _slug_tag(categoria))
    if subcategoria:
        tags.append("#" + _slug_tag(subcategoria))
    # dedup preservando ordem
    return " ".join(dict.fromkeys(tags))


def short_title(titulo: str, max_len: int = 60) -> str:
    titulo = " ".join(titulo.split())
    if len(titulo) <= max_len:
        return titulo
    corte = titulo[:max_len]
    return (corte.rsplit(" ", 1)[0] if " " in corte else corte).strip()


# =============================================================================
# Dicas educativas (sem produto)
# =============================================================================
EDUCATIONAL_TIPS = [
    {
        "titulo": "DESCONTO FAKE EXISTE",
        "corpo": "Muita loja sobe o preço antes de \"baixar\". A porcentagem "
                 "engana. O que importa é o histórico.",
        "caption": "🧠 Desconto fake é real.\n\nMuita loja infla o preço antes "
                   "do \"promo\". Sem histórico, você nunca sabe se é oferta de "
                   "verdade.\n\nA gente monitora pra você.",
    },
    {
        "titulo": "% ALTA NÃO É MENOR PREÇO",
        "corpo": "40% de desconto pode ser mais caro que o preço de mês "
                 "passado. Compare com a média, não com o \"de/por\".",
        "caption": "📊 Desconto alto não significa menor preço.\n\nO que importa "
                   "é: quanto já custou antes? É isso que a gente acompanha "
                   "todo dia.",
    },
    {
        "titulo": "ANTES DE COMPRAR",
        "corpo": "1) Veja o histórico  2) Compare a média  3) Olhe a "
                 "volatilidade. Quem monitora paga menos.",
        "caption": "🔎 Antes de comprar qualquer coisa:\n\n1️⃣ Veja o histórico\n"
                   "2️⃣ Compare a média\n3️⃣ Analise a volatilidade\n\nQuem "
                   "monitora paga menos.",
    },
]


# =============================================================================
# Legendas por tipo
# =============================================================================
def _product_footer(post) -> list[str]:
    return [
        "",
        pick(URGENCIA),
        "",
        pick(CTA_LINES),
        "",
        hashtags(post.get("categoria_slug"), post.get("subcategoria_slug"),
                 post["post_type"]),
    ]


def _caption_price_drop(post) -> str:
    economia = post["preco_anterior"] - post["preco_atual"]
    linhas = [
        f"{pick(EMOJIS_ALERTA)} QUEDA DE PREÇO",
        "",
        short_title(post["titulo"], 80),
        "",
        f"De {brl(post['preco_anterior'])}",
        f"Por {brl(post['preco_atual'])}",
        f"{pick(EMOJIS_QUEDA)} -{post['desconto_pct']:.0f}% • "
        f"{pick(EMOJIS_PRECO)} economiza {brl(economia)}",
    ]
    return "\n".join(linhas + _product_footer(post))


def _caption_all_time_low(post) -> str:
    linhas = [
        f"{pick(EMOJIS_FOGO)} MENOR PREÇO DA HISTÓRIA",
        "",
        short_title(post["titulo"], 80),
        "",
        f"{pick(EMOJIS_PRECO)} {brl(post['preco_atual'])}",
        f"{pick(EMOJIS_QUEDA)} Menor valor em {post['total_registros']} medições.",
        "Nunca esteve tão barato.",
    ]
    return "\n".join(linhas + _product_footer(post))


def _caption_below_average(post) -> str:
    linhas = [
        f"{pick(EMOJIS_FOGO)} {post['abaixo_media_pct']:.0f}% ABAIXO DA MÉDIA",
        "",
        short_title(post["titulo"], 80),
        "",
        f"{pick(EMOJIS_PRECO)} {brl(post['preco_atual'])}",
        f"Média histórica: {brl(post['avg_price'])}",
        "Tá valendo a pena agora.",
    ]
    return "\n".join(linhas + _product_footer(post))


def _caption_educational(post) -> str:
    return (
        f"{post['caption']}\n\n"
        f"Siga {HANDLE} pra economizar todo dia.\n\n"
        "#promoção #economia #desconto #consumoconsciente #dicas"
    )


def caption_for(post) -> str:
    return {
        PRICE_DROP: _caption_price_drop,
        ALL_TIME_LOW: _caption_all_time_low,
        BELOW_AVERAGE: _caption_below_average,
        EDUCATIONAL: _caption_educational,
    }[post["post_type"]](post)
