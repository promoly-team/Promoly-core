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
    ):

        query = """
            WITH historico AS (
                SELECT
                    produto_id,
                    MIN(preco) AS menor_preco_historico
                FROM produto_preco_historico
                GROUP BY produto_id
            ),
            ultimo_preco AS (
                SELECT
                    produto_id,
                    preco,
                    created_at,
                    ROW_NUMBER() OVER (
                        PARTITION BY produto_id
                        ORDER BY created_at DESC
                    ) AS rn
                FROM produto_preco_historico
            )

            SELECT
                p.id AS produto_id,
                p.titulo,
                p.imagem_url,
                u.preco AS preco_atual,
                h.menor_preco_historico,
                la.url_afiliada,
                c.slug AS categoria_slug,
                s.slug AS subcategoria_slug

            FROM produtos p

            JOIN links_afiliados la
                ON la.produto_id = p.id
                AND la.status = 'ok'
                AND la.url_afiliada IS NOT NULL
                AND la.url_afiliada != ''

            JOIN ultimo_preco u
                ON u.produto_id = p.id
                AND u.rn = 1

            JOIN historico h
                ON h.produto_id = p.id

            JOIN produto_categoria pc
                ON pc.produto_id = p.id

            JOIN categorias c
                ON c.id = pc.categoria_id

            LEFT JOIN produto_subcategoria ps
                ON ps.produto_id = p.id

            LEFT JOIN subcategorias s
                ON s.id = ps.subcategoria_id

            WHERE
                u.preco <= h.menor_preco_historico
                AND (:categoria_slug IS NULL OR c.slug = :categoria_slug)
                AND (:subcategoria_slug IS NULL OR s.slug = :subcategoria_slug)

            ORDER BY u.preco ASC
            LIMIT :limit
        """

        result = self.db.execute(
            text(query),
            {
                "limit": limit,
                "categoria_slug": categoria_slug,
                "subcategoria_slug": subcategoria_slug,
            },
        )

        return result.mappings().all()
