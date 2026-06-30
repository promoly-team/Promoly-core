"""Geração de conteúdo (dados) dos posts do Instagram.

Escolhe o tipo de post do dia (rotação semanal em posts.instagram.copy), busca a
oferta certa no DealService e devolve um dict normalizado pronto pro
image_builder (slides) e pra legenda. Toda a parte textual/visual vive em copy.py.
"""
from api.services.deal_service import DealService
from api.services.twitter_content_service import CATEGORY_ROTATION
from posts.instagram import copy
from sqlalchemy import text


class InstagramContentService:

    def __init__(self, db):
        self.db = db
        self.deal_service = DealService(db)

    # -------------------------------------------------
    # Rotação de categoria (compartilha histórico do Twitter)
    # -------------------------------------------------
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

    # -------------------------------------------------
    # Busca por tipo
    # -------------------------------------------------
    def _fetch_price_drop(self):
        cat = self._next_category()
        deals = (
            self.deal_service.get_deals(limit=10, categoria_slug=cat, exclude_recent_days=7)
            or self.deal_service.get_deals(limit=10, exclude_recent_days=7)
        )
        if not deals:
            return None
        d = deals[0]
        return {
            "post_type": copy.PRICE_DROP,
            "produto_id": d["produto_id"],
            "titulo": d["titulo"],
            "imagem_url": d.get("imagem_url"),
            "url_afiliada": d.get("url_afiliada"),
            "categoria_slug": d.get("categoria_slug"),
            "subcategoria_slug": d.get("subcategoria_slug"),
            "preco_atual": float(d["preco_atual"]),
            "preco_anterior": float(d["preco_anterior"]),
            "desconto_pct": float(d["desconto_pct"]),
        }

    def _fetch_atl(self, post_type):
        """all_time_low e below_average partem da mesma query (preço == mínimo,
        logo abaixo da média). Variam só a ordenação/enquadramento."""
        rows = self.deal_service.get_all_time_low(limit=15, exclude_recent_days=7)
        if not rows:
            return None

        if post_type == copy.BELOW_AVERAGE:
            # o que está mais abaixo da média (price_diff_percent mais negativo)
            row = min(rows, key=lambda r: float(r["price_diff_percent"]))
        else:
            row = rows[0]  # menor preço absoluto (query já ordena por preço ASC)

        return {
            "post_type": post_type,
            "produto_id": row["produto_id"],
            "titulo": row["titulo"],
            "imagem_url": row.get("imagem_url"),
            "url_afiliada": row.get("url_afiliada"),
            "categoria_slug": row.get("categoria_slug"),
            "subcategoria_slug": row.get("subcategoria_slug"),
            "preco_atual": float(row["current_price"]),
            "avg_price": float(row["avg_price"]),
            "min_price": float(row["min_price"]),
            "total_registros": int(row["total_registros"]),
            "abaixo_media_pct": abs(float(row["price_diff_percent"])),
        }

    def _fetch(self, post_type):
        if post_type == copy.PRICE_DROP:
            return self._fetch_price_drop()
        if post_type in (copy.ALL_TIME_LOW, copy.BELOW_AVERAGE):
            return self._fetch_atl(post_type)
        return None

    def _educational(self):
        tip = copy.pick(copy.EDUCATIONAL_TIPS)
        return {
            "post_type": copy.EDUCATIONAL,
            "titulo": tip["titulo"],
            "corpo": tip["corpo"],
            "caption": tip["caption"],
        }

    # -------------------------------------------------
    # API pública
    # -------------------------------------------------
    def generate_daily_post(self, post_type=None):
        """Monta o post do dia. Retorna dict (com 'caption') ou None.

        Pro tipo do dia (rotação semanal) tenta a oferta correspondente; se não
        houver, cai pros outros tipos de produto antes de desistir.
        """
        post_type = post_type or copy.post_type_for()

        if post_type == copy.EDUCATIONAL:
            post = self._educational()
            post["caption"] = copy.caption_for(post)
            return post

        # cadeia de fallback entre tipos de produto
        order = [post_type] + [
            t for t in (copy.PRICE_DROP, copy.ALL_TIME_LOW, copy.BELOW_AVERAGE)
            if t != post_type
        ]
        post = next((p for p in (self._fetch(t) for t in order) if p), None)
        if not post:
            return None
        if not post.get("imagem_url"):
            return None

        post["caption"] = copy.caption_for(post)
        return post
