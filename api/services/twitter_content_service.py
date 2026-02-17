from sqlalchemy import text
from api.services.deal_service import DealService

CATEGORY_ROTATION = [
    "eletronicos",
    "casa",
    "pet",
    "informatica",
    "games",
    "fitness",
    "automotivo",
    "limpeza",
    "iluminacao",
]

class TwitterContentService:

    def __init__(self, db):
        self.db = db
        self.deal_service = DealService(db)

    # -------------------------------------------------
    # 🔐 REGISTRA POST PARA EVITAR REPETIÇÃO
    # -------------------------------------------------

    def _register_post(
        self,
        produto_id: int,
        categoria_slug: str | None,
        subcategoria_slug: str | None,
        tipo_post: str,
        tweet_text: str,
    ):

        self.db.execute(
            text("""
                INSERT INTO twitter_posts (
                    produto_id,
                    categoria_slug,
                    subcategoria_slug,
                    tipo_post,
                    tweet_text
                )
                VALUES (
                    :produto_id,
                    :categoria_slug,
                    :subcategoria_slug,
                    :tipo_post,
                    :tweet_text
                )
            """),
            {
                "produto_id": produto_id,
                "categoria_slug": categoria_slug,
                "subcategoria_slug": subcategoria_slug,
                "tipo_post": tipo_post,
                "tweet_text": tweet_text,
            },
        )

        self.db.commit()

    # -------------------------------------------------
    # 🔄 ROTAÇÃO DE CATEGORIA
    # -------------------------------------------------

    def _get_next_category(self):

        result = self.db.execute(
            text("""
                SELECT categoria_slug
                FROM twitter_posts
                WHERE categoria_slug IS NOT NULL
                ORDER BY created_at DESC
                LIMIT 1
            """)
        ).fetchone()

        if not result:
            return CATEGORY_ROTATION[0]

        last_category = result[0]

        if last_category not in CATEGORY_ROTATION:
            return CATEGORY_ROTATION[0]

        current_index = CATEGORY_ROTATION.index(last_category)
        next_index = (current_index + 1) % len(CATEGORY_ROTATION)

        return CATEGORY_ROTATION[next_index]

    # -------------------------------------------------
    # 🚨 QUEDA REAL DE PREÇO
    # -------------------------------------------------

    def generate_price_drop_tweet(self):

        next_category = self._get_next_category()

        deals = self.deal_service.get_deals(
            limit=10,
            categoria_slug=next_category,
            exclude_recent_days=7
        )

        if not deals:
            return None

        deal = deals[0]

        economia = deal["preco_anterior"] - deal["preco_atual"]

        tweet = (
            f"🚨 {deal['desconto_pct']:.0f}% DE QUEDA REAL! ({next_category.upper()})\n\n"
            f"{deal['titulo'][:70]}\n\n"
            f"De R$ {deal['preco_anterior']:.2f} → R$ {deal['preco_atual']:.2f}\n"
            f"💸 Economia: R$ {economia:.2f}\n\n"
            f"{deal['url_afiliada']}"
        )[:280]

        self._register_post(
            produto_id=deal["produto_id"],
            categoria_slug=deal.get("categoria_slug"),
            subcategoria_slug=deal.get("subcategoria_slug"),
            tipo_post="price_drop",
            tweet_text=tweet
        )

        return tweet

    # -------------------------------------------------
    # 📉 MENOR PREÇO HISTÓRICO
    # -------------------------------------------------

    def generate_all_time_low_tweet(self):

        products = self.deal_service.get_all_time_low(
            limit=10,
            exclude_recent_days=7
        )

        if not products:
            return None

        p = products[0]

        tweet = (
            f"📉 MENOR PREÇO JÁ REGISTRADO!\n\n"
            f"{p['titulo'][:70]}\n\n"
            f"💰 Apenas R$ {p['preco_atual']:.2f}\n\n"
            f"⚠️ Esse é o menor valor desde que começamos a monitorar.\n\n"
            f"👉 {p['url_afiliada']}"
        )[:280]

        self._register_post(
            produto_id=p["produto_id"],
            categoria_slug=p.get("categoria_slug"),
            subcategoria_slug=p.get("subcategoria_slug"),
            tipo_post="all_time_low",
            tweet_text=tweet
        )

        return tweet
