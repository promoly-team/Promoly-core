"""Geração de conteúdo para posts do Instagram.

Espelha a ideia do TwitterContentService: usa o DealService para escolher uma
oferta forte (com rotação de categoria) e monta a legenda do feed. Diferente do
Twitter, a legenda do IG é mais longa, leva link de afiliado e hashtags.
"""
import random

from api.services.deal_service import DealService
from api.services.twitter_content_service import (
    CATEGORY_ROTATION,
    EMOJIS_ALERTA,
    EMOJIS_PRECO,
    EMOJIS_QUEDA,
)
from sqlalchemy import text


class InstagramContentService:

    def __init__(self, db):
        self.db = db
        self.deal_service = DealService(db)

    def _emoji(self, pool):
        return random.choice(pool)

    def _next_category(self):
        last = self.db.execute(text("""
            SELECT categoria_slug
            FROM twitter_posts
            WHERE categoria_slug IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 1
        """)).scalar()

        if not last or last not in CATEGORY_ROTATION:
            return CATEGORY_ROTATION[0]

        idx = CATEGORY_ROTATION.index(last)
        return CATEGORY_ROTATION[(idx + 1) % len(CATEGORY_ROTATION)]

    def _hashtags(self, categoria, subcategoria):
        tags = ["#promoção", "#desconto", "#economia", "#ofertas", "#menorpreço"]
        if categoria:
            tags.append(f"#{categoria.replace(' ', '').replace('-', '')}")
        if subcategoria:
            tags.append(f"#{subcategoria.replace(' ', '').replace('-', '')}")
        return " ".join(tags)

    def _caption(self, deal):
        titulo = deal["titulo"].strip()
        preco_atual = float(deal["preco_atual"])
        preco_anterior = float(deal["preco_anterior"])
        economia = preco_anterior - preco_atual
        desconto = float(deal["desconto_pct"])
        link = deal.get("url_afiliada") or ""

        linhas = [
            f"{self._emoji(EMOJIS_ALERTA)} PREÇO DESPENCOU",
            "",
            titulo,
            "",
            f"De R$ {preco_anterior:.2f} por R$ {preco_atual:.2f}".replace(".", ","),
            f"{self._emoji(EMOJIS_QUEDA)} -{desconto:.0f}% no histórico",
            f"{self._emoji(EMOJIS_PRECO)} Economia de R$ {economia:.2f}".replace(".", ","),
            "",
            "Se subir, não volta nesse valor.",
        ]

        if link:
            linhas += ["", f"🔗 Link na bio ou: {link}"]

        linhas += ["", self._hashtags(deal.get("categoria_slug"), deal.get("subcategoria_slug"))]

        return "\n".join(linhas)

    def generate_daily_post(self):
        """Escolhe a melhor oferta do dia e devolve dados prontos para postar.

        Retorna None se não houver oferta elegível.
        """
        categoria = self._next_category()

        deals = self.deal_service.get_deals(
            limit=10,
            categoria_slug=categoria,
            exclude_recent_days=7,
        )

        # Fallback: sem oferta na categoria da vez, pega a melhor geral.
        if not deals:
            deals = self.deal_service.get_deals(limit=10, exclude_recent_days=7)

        if not deals:
            return None

        deal = deals[0]

        return {
            "produto_id": deal["produto_id"],
            "titulo": deal["titulo"],
            "imagem_url": deal.get("imagem_url"),
            "preco_atual": float(deal["preco_atual"]),
            "preco_anterior": float(deal["preco_anterior"]),
            "desconto_pct": float(deal["desconto_pct"]),
            "url_afiliada": deal.get("url_afiliada"),
            "categoria_slug": deal.get("categoria_slug"),
            "subcategoria_slug": deal.get("subcategoria_slug"),
            "caption": self._caption(deal),
        }
