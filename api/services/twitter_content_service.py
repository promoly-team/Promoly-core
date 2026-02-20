import re
import random
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


EMOJIS_HEADLINE = ["💸", "🔥", "🚨", "💥", "⚡"]
EMOJIS_PRECO = ["💰", "💵", "💲"]
EMOJIS_QUEDA = ["📉", "⬇️", "🔻"]
EMOJIS_ALERTA = ["⚠️", "🚨", "🔔"]
EMOJIS_URGENCIA = ["⏳", "⌛", "🔥"]


EDUCATIONAL_TWEETS = [

    "🧠 Sabia que muitas lojas aumentam o preço antes de aplicar “desconto”?\n\nPor isso olhar só a porcentagem engana.\nHistórico é o que importa.",

    "📊 Nem toda promoção é oportunidade.\n\nSe o preço já esteve menor antes, talvez valha esperar.\nMonitoramento muda o jogo.",

    "💡 Desconto alto não significa menor preço.\n\nO que importa é:\nQuanto já custou antes?\n\nÉ isso que a gente monitora.",

    "📉 Produto caiu 40% hoje.\n\nMas já caiu 60% mês passado.\n\nPromoção boa é contexto, não impulso.",

    "🔎 Antes de comprar qualquer coisa:\n\n1️⃣ Veja o histórico\n2️⃣ Compare média\n3️⃣ Analise volatilidade\n\nQuem monitora paga menos.",

    "⚠️ Muitas ofertas são só marketing.\n\nPreço sobe.\nDepois 'cai'.\n\nSem histórico, você nunca sabe.",

    "💸 Comprar no impulso custa caro.\nComprar com dados custa menos.\n\nMonitoramento é vantagem.",

    "📊 O mercado oscila.\n\nQuem entende o padrão paga menos.\nQuem compra no hype paga mais.",

    "🔥 Promoção boa não é a que parece maior.\nÉ a que está realmente no fundo do histórico.",

    "🧠 Informação é desconto invisível.\n\nQuem tem dado compra melhor."
]

class TwitterContentService:


    def __init__(self, db):
        self.db = db
        self.deal_service = DealService(db)

    # =================================================
    # 🎲 UTIL
    # =================================================

    def _emoji(self, pool):
        return random.choice(pool)

    # =================================================
    # ✂️ TÍTULO INTELIGENTE
    # =================================================

    def _smart_truncate_title(self, titulo: str, max_length: int = 70):

        titulo = re.sub(r"\s+", " ", titulo).strip()

        palavras_irrelevantes = [
            "original", "novo", "nova",
            "oficial", "importado", "100%"
        ]

        for palavra in palavras_irrelevantes:
            titulo = re.sub(
                rf"\b{palavra}\b", "", titulo, flags=re.IGNORECASE
            )

        titulo = re.sub(r"\s+", " ", titulo).strip()

        if len(titulo) <= max_length:
            return titulo

        corte = titulo[:max_length]
        if " " in corte:
            corte = corte.rsplit(" ", 1)[0]

        return corte.strip()

    # =================================================
    # 🏷 HASHTAGS
    # =================================================

    def _generate_hashtags(self, categoria, subcategoria):

        tags = ["#Economize", "#Promoção", "#MenorPreço"]

        if categoria:
            tags.append(f"#{categoria.replace(' ', '')}")

        if subcategoria:
            tags.append(f"#{subcategoria.replace(' ', '')}")

        return " ".join(tags[:6])

    # =================================================
    # 🔐 REGISTRA POST
    # =================================================

    def _register_post(
        self,
        produto_id,
        categoria_slug,
        subcategoria_slug,
        tipo_post,
        tweet_text,
        copy_type,
    ):

        result = self.db.execute(
            text("""
                INSERT INTO twitter_posts (
                    produto_id,
                    categoria_slug,
                    subcategoria_slug,
                    tipo_post,
                    tweet_text,
                    copy_type
                )
                VALUES (
                    :produto_id,
                    :categoria_slug,
                    :subcategoria_slug,
                    :tipo_post,
                    :tweet_text,
                    :copy_type
                )
                RETURNING id
            """),
            {
                "produto_id": produto_id,
                "categoria_slug": categoria_slug,
                "subcategoria_slug": subcategoria_slug,
                "tipo_post": tipo_post,
                "tweet_text": tweet_text,
                "copy_type": copy_type,
            },
        )

        twitter_post_id = result.scalar()
        self.db.commit()

        return twitter_post_id

    # =================================================
    # 🔗 FINALIZA COM TRACKING
    # =================================================

    def _finalize_with_tracking(self, twitter_post_id, produto_id, tweet_base, url_afiliada):

        product_url = f"https://promoly-core.vercel.app/produto/{produto_id}"

        tweet_final = tweet_base[:280]

        self.db.execute(
            text("""
                UPDATE twitter_posts
                SET tweet_text = :tweet_text
                WHERE id = :id
            """),
            {"tweet_text": tweet_final, "id": twitter_post_id}
        )

        self.db.commit()

        return {
            "tweet_text": tweet_final,
            "product_url": product_url,
            "url_afiliada": url_afiliada
        }


    # =================================================
    # 🔄 ROTAÇÃO DE CATEGORIA
    # =================================================

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

    # =================================================
    # 🚨 PRICE DROP
    # =================================================

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

        preco_anterior = deal["preco_anterior"]
        preco_atual = deal["preco_atual"]
        economia = preco_anterior - preco_atual
        desconto_pct = deal["desconto_pct"]

        titulo = self._smart_truncate_title(deal["titulo"])

        tweet_base = (
            f"{self._emoji(EMOJIS_ALERTA)} MENOR PREÇO JÁ REGISTRADO\n\n"
            f"{titulo}\n\n"
            f"De R$ {preco_anterior:.0f} → R$ {preco_atual:.0f}\n\n"
            f"{self._emoji(EMOJIS_QUEDA)} -{desconto_pct:.0f}% no histórico\n"
            f"{self._emoji(EMOJIS_PRECO)} Economia real: R$ {economia:.0f}\n\n"
            "Se subir, não volta nesse valor."
        )

        twitter_post_id = self._register_post(
            produto_id=deal["produto_id"],
            categoria_slug=deal.get("categoria_slug"),
            subcategoria_slug=deal.get("subcategoria_slug"),
            tipo_post="price_drop",
            tweet_text=tweet_base,
            copy_type="price_drop_v2"
        )

        return self._finalize_with_tracking(
            twitter_post_id,
            deal["produto_id"],
            tweet_base,
            deal.get("url_afiliada")
        )


    # =================================================
    # 📉 ALL TIME LOW
    # =================================================

    def generate_all_time_low_tweet(self):

        products = self.deal_service.get_all_time_low(
            limit=10,
            exclude_recent_days=7
        )

        if not products:
            return None

        p = products[0]

        titulo = self._smart_truncate_title(p["titulo"])
        preco = p["current_price"]

        tweet_base = (
            f"{self._emoji(EMOJIS_ALERTA)} MENOR PREÇO JÁ REGISTRADO\n\n"
            f"{titulo}\n\n"
            f"💰 Apenas R$ {preco:.0f}\n\n"
            "📉 Esse é o menor valor desde que começamos a monitorar.\n\n"
            "Se subir, não volta nesse valor."
        )

        twitter_post_id = self._register_post(
            produto_id=p["produto_id"],
            categoria_slug=p.get("categoria_slug"),
            subcategoria_slug=p.get("subcategoria_slug"),
            tipo_post="all_time_low",
            tweet_text=tweet_base,
            copy_type="all_time_low_v2"
        )

        return self._finalize_with_tracking(
            twitter_post_id,
            p["produto_id"],
            tweet_base,
            p.get("url_afiliada")
        )


    # =================================================
    # 🔥 HISTORICAL ROTATING (DINÂMICO)
    # =================================================

    def generate_rotating_historical_tweet(self):

        last = self.db.execute(text("""
            SELECT categoria_slug
            FROM twitter_posts
            WHERE categoria_slug IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 1
        """)).scalar()

        next_category = (
            CATEGORY_ROTATION[0]
            if not last or last not in CATEGORY_ROTATION
            else CATEGORY_ROTATION[
                (CATEGORY_ROTATION.index(last) + 1) % len(CATEGORY_ROTATION)
            ]
        )

        deal = self.deal_service.get_rotating_strong_deal(
            categoria_slug=next_category,
            exclude_recent_days=7
        )

        if not deal:
            return None

        titulo = self._smart_truncate_title(deal["titulo"])

        # ✅ CORREÇÃO AQUI
        preco = f"R$ {deal['current_price']:.2f}".replace(".", ",")

        percentual = deal["price_diff_percent"]

        # 🔥 Só posta se realmente estiver abaixo da média
        if percentual >= 0:
            return None

        desconto = f"{abs(percentual):.0f}%"

        tweet_base = (
            f"{self._emoji(EMOJIS_HEADLINE)} {desconto} MAIS BARATO que a média!\n\n"
            f"{titulo}\n\n"
            f"{self._emoji(EMOJIS_PRECO)} {preco}\n\n"
            f"{self._emoji(EMOJIS_QUEDA)} Menor preço já registrado."
        )

        twitter_post_id = self._register_post(
            produto_id=deal["produto_id"],
            categoria_slug=deal["categoria_slug"],
            subcategoria_slug=None,
            tipo_post="historical_strong",
            tweet_text=tweet_base,
            copy_type="historical"
        )

        return self._finalize_with_tracking(
            twitter_post_id,
            deal["produto_id"],
            tweet_base
        )


    def generate_educational_tweet(self):

        text = random.choice(EDUCATIONAL_TWEETS)

        return {
            "tweet_text": text,
            "product_url": "",
            "affiliate_url": ""
        }
