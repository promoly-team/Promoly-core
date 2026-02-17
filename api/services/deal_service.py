from sqlalchemy import text
from sqlalchemy.orm import Session


class DealService:
    """
    Serviço responsável por recuperar:

    - Deals recentes (queda entre último e penúltimo preço)
    - Produtos no menor preço da história (all time low)

    Agora com filtros opcionais por:
    - categoria_slug
    - subcategoria_slug
    """

    def __init__(self, db: Session):
        self.db = db

    # -------------------------------------------------
    # 🔥 DEALS RECENTES (último preço vs anterior)
    # -------------------------------------------------

    def _get_product_title(self, produto_id: int):
        result = self.db.execute(text("""
            SELECT titulo
            FROM produtos
            WHERE id = :produto_id
        """), {"produto_id": produto_id}).scalar()

        return result


    def get_deals(
        self,
        limit: int = 20,
        categoria_slug: str | None = None,
        subcategoria_slug: str | None = None,
        exclude_recent_days: int | None = None,
    ):

        exclusion_clause = ""
        if exclude_recent_days:
            exclusion_clause = """
                AND p.id NOT IN (
                    SELECT produto_id
                    FROM twitter_posts
                    WHERE created_at > NOW() - INTERVAL :days
                )
            """

        query = f"""
            WITH precos AS (
                SELECT
                    produto_id,
                    preco,
                    created_at,
                    ROW_NUMBER() OVER (
                        PARTITION BY produto_id
                        ORDER BY created_at DESC
                    ) AS rn
                FROM produto_preco_historico
            ),
            comparacao AS (
                SELECT
                    p.id AS produto_id,
                    p.titulo,
                    p.imagem_url,
                    u.preco AS preco_atual,
                    a.preco AS preco_anterior,
                    la.url_afiliada,
                    c.slug AS categoria_slug,
                    s.slug AS subcategoria_slug,
                    ROUND(
                        (((a.preco - u.preco) / a.preco) * 100)::numeric,
                        2
                    ) AS desconto_pct

                FROM produtos p

                JOIN links_afiliados la
                    ON la.produto_id = p.id
                    AND la.status = 'ok'
                    AND la.url_afiliada IS NOT NULL
                    AND la.url_afiliada != ''

                JOIN precos u
                    ON u.produto_id = p.id AND u.rn = 1

                JOIN precos a
                    ON a.produto_id = p.id AND a.rn = 2

                JOIN produto_categoria pc
                    ON pc.produto_id = p.id

                JOIN categorias c
                    ON c.id = pc.categoria_id

                LEFT JOIN produto_subcategoria ps
                    ON ps.produto_id = p.id

                LEFT JOIN subcategorias s
                    ON s.id = ps.subcategoria_id

                WHERE
                    u.preco < a.preco
                    AND a.preco > 0
                    AND (:categoria_slug IS NULL OR c.slug = :categoria_slug)
                    AND (:subcategoria_slug IS NULL OR s.slug = :subcategoria_slug)
                    {exclusion_clause}
            )

            SELECT *
            FROM comparacao
            ORDER BY desconto_pct DESC
            LIMIT :limit
        """

        params = {
            "limit": limit,
            "categoria_slug": categoria_slug,
            "subcategoria_slug": subcategoria_slug,
        }

        if exclude_recent_days:
            params["days"] = f"'{exclude_recent_days} days'"

        result = self.db.execute(text(query), params)

        return result.mappings().all()

    # -------------------------------------------------
    # 📉 ALL TIME LOW
    # -------------------------------------------------

    def get_all_time_low(
        self,
        limit: int = 20,
        categoria_slug: str | None = None,
        subcategoria_slug: str | None = None,
        exclude_recent_days: int | None = None,
    ):

        exclusion_clause = ""
        if exclude_recent_days:
            exclusion_clause = """
                AND p.id NOT IN (
                    SELECT produto_id
                    FROM twitter_posts
                    WHERE created_at > NOW() - (:exclude_days || ' days')::interval
                )
            """

        query = f"""
            WITH historico AS (
                SELECT
                    produto_id,
                    preco,
                    created_at,
                    ROW_NUMBER() OVER (
                        PARTITION BY produto_id
                        ORDER BY created_at DESC
                    ) AS rn
                FROM produto_preco_historico
            ),
            agregados AS (
                SELECT
                    produto_id,
                    AVG(preco) AS avg_price,
                    MIN(preco) AS min_price,
                    MAX(preco) AS max_price,
                    COUNT(*) AS total_registros
                FROM produto_preco_historico
                GROUP BY produto_id
            )

            SELECT
                p.id AS produto_id,
                p.titulo,
                p.imagem_url,
                u.preco AS current_price,
                a.avg_price,
                a.min_price,
                a.max_price,
                a.total_registros,
                ROUND(
                    ((u.preco - a.avg_price) / a.avg_price) * 100,
                    2
                ) AS price_diff_percent,
                la.url_afiliada,
                c.slug AS categoria_slug,
                s.slug AS subcategoria_slug

            FROM produtos p

            JOIN links_afiliados la
                ON la.produto_id = p.id
                AND la.status = 'ok'
                AND la.url_afiliada IS NOT NULL
                AND la.url_afiliada != ''

            JOIN historico u
                ON u.produto_id = p.id
                AND u.rn = 1

            JOIN agregados a
                ON a.produto_id = p.id

            JOIN produto_categoria pc
                ON pc.produto_id = p.id

            JOIN categorias c
                ON c.id = pc.categoria_id

            LEFT JOIN produto_subcategoria ps
                ON ps.produto_id = p.id

            LEFT JOIN subcategorias s
                ON s.id = ps.subcategoria_id

            WHERE
                u.preco = a.min_price
                AND (:categoria_slug IS NULL OR c.slug = :categoria_slug)
                AND (:subcategoria_slug IS NULL OR s.slug = :subcategoria_slug)
                {exclusion_clause}

            ORDER BY u.preco ASC
            LIMIT :limit
        """

        params = {
            "limit": limit,
            "categoria_slug": categoria_slug,
            "subcategoria_slug": subcategoria_slug,
        }

        if exclude_recent_days:
            params["exclude_days"] = exclude_recent_days

        result = self.db.execute(text(query), params)

        return result.mappings().all()



    def get_rotating_strong_deal(self, categoria_slug, exclude_recent_days=7):

        produtos = self.db.execute(text("""
            SELECT p.id
            FROM produtos p
            JOIN produto_categoria pc ON pc.produto_id = p.id
            JOIN categorias c ON c.id = pc.categoria_id
            WHERE c.slug = :categoria_slug
            AND p.id NOT IN (
                SELECT produto_id
                FROM twitter_posts
                WHERE created_at >= NOW() - (:exclude_recent_days || ' days')::interval
            )
        """), {
            "categoria_slug": categoria_slug,
            "exclude_recent_days": exclude_recent_days
        }).scalars().all()

        for produto_id in produtos:

            metrics = self.get_price_metrics(produto_id)

            if not metrics:
                continue

            # 🔥 Forte oportunidade real
            if (
                metrics["price_diff_percent"] <= -20
                and metrics["current_price"] == metrics["min_price"]
                and metrics["total_registros"] >= 3
            ):
                return {
                    "produto_id": produto_id,
                    "titulo": self._get_product_title(produto_id),
                    "preco_atual": metrics["current_price"],
                    "avg_price": metrics["avg_price"],
                    "min_price": metrics["min_price"],
                    "price_diff_percent": metrics["price_diff_percent"],
                    "categoria_slug": categoria_slug,
                }

        return None

    def get_price_metrics(self, produto_id: int):
        """
        Replica EXATAMENTE a lógica do frontend:
        - avg = média simples de todos os preços
        - current = último preço do histórico
        - diff% = ((current - avg) / avg) * 100
        """

        result = self.db.execute(text("""
            WITH historico AS (
                SELECT
                    produto_id,
                    preco,
                    created_at,
                    ROW_NUMBER() OVER (
                        PARTITION BY produto_id
                        ORDER BY created_at DESC
                    ) AS rn
                FROM produto_preco_historico
                WHERE produto_id = :produto_id
            ),
            media AS (
                SELECT
                    produto_id,
                    AVG(preco) AS avg_price,
                    MIN(preco) AS min_price,
                    MAX(preco) AS max_price,
                    COUNT(*) AS total_registros
                FROM produto_preco_historico
                WHERE produto_id = :produto_id
                GROUP BY produto_id
            )

            SELECT
                h.preco AS current_price,
                m.avg_price,
                m.min_price,
                m.max_price,
                m.total_registros,
                ROUND(
                    (((h.preco - m.avg_price) / m.avg_price) * 100)::numeric,
                    2
                ) AS price_diff_percent

            FROM historico h
            JOIN media m ON m.produto_id = h.produto_id
            WHERE h.rn = 1
        """), {"produto_id": produto_id}).mappings().first()

        return result
