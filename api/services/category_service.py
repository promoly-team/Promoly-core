from sqlalchemy import text
from sqlalchemy.orm import Session
from api.utils.pricing import calculate_discount


class CategoryService:

    def __init__(self, db: Session):
        self.db = db

    # =====================================================
    # PRODUCTS BY SLUG (PAGINADO E ORDENADO NO SQL)
    # =====================================================

    def get_products_by_category_slug(
        self,
        slug: str,
        limit: int = 20,
        offset: int = 0,
        search: str | None = None,
        order: str = "desconto",
    ):

        search_filter = ""
        if search:
            search_filter = "AND LOWER(p.titulo) LIKE LOWER(:search)"

        order_clause = """
            CASE
                WHEN a.preco IS NOT NULL
                    AND u.preco IS NOT NULL
                THEN ((a.preco - u.preco) / a.preco)
                ELSE -1
            END DESC
        """


        if order == "preco":
            order_clause = "preco_atual ASC"
        elif order == "recentes":
            order_clause = "p.id DESC"

        query = f"""
            WITH precos AS (
                SELECT
                    produto_id,
                    preco,
                    ROW_NUMBER() OVER (
                        PARTITION BY produto_id
                        ORDER BY created_at DESC
                    ) AS rn
                FROM produto_preco_historico
            )

            SELECT
                p.id AS produto_id,
                p.slug,
                p.titulo,
                p.imagem_url,
                u.preco AS preco_atual,
                a.preco AS preco_anterior,
                la.url_afiliada
            FROM produtos p

            JOIN produto_categoria pc
                ON pc.produto_id = p.id

            JOIN categorias c
                ON c.id = pc.categoria_id
                AND c.slug = :slug

            JOIN links_afiliados la
                ON la.produto_id = p.id
                AND la.status = 'ok'
                AND la.url_afiliada IS NOT NULL
                AND la.url_afiliada != ''

            JOIN precos u
                ON u.produto_id = p.id AND u.rn = 1

            LEFT JOIN precos a
                ON a.produto_id = p.id AND a.rn = 2

            WHERE 1=1
            {search_filter}

            ORDER BY {order_clause}

            LIMIT :limit OFFSET :offset
        """

        params = {
            "slug": slug,
            "limit": limit,
            "offset": offset,
        }

        if search:
            params["search"] = f"%{search}%"

        result = self.db.execute(text(query), params)

        rows = result.mappings().all()

        produtos = []

        for row in rows:
            preco_atual = float(row["preco_atual"]) if row["preco_atual"] else None
            preco_anterior = float(row["preco_anterior"]) if row["preco_anterior"] else None

            desconto = calculate_discount(preco_atual, preco_anterior)

            produtos.append({
                "produto_id": row["produto_id"],
                "slug": row["slug"],
                "titulo": row["titulo"],
                "imagem_url": row["imagem_url"],
                "preco_atual": preco_atual,
                "preco_anterior": preco_anterior,
                "desconto_pct": desconto,
                "url_afiliada": row["url_afiliada"],
            })

        return produtos

    # =====================================================
    # TOTAL CORRIGIDO (COM MESMOS FILTROS)
    # =====================================================

    def get_category_total(self, slug: str):
        result = self.db.execute(
            text("""
                SELECT COUNT(DISTINCT p.id)
                FROM produtos p

                JOIN produto_categoria pc
                    ON pc.produto_id = p.id

                JOIN categorias c
                    ON c.id = pc.categoria_id
                    AND c.slug = :slug

                JOIN links_afiliados la
                    ON la.produto_id = p.id
                    AND la.status = 'ok'
                    AND la.url_afiliada IS NOT NULL
                    AND la.url_afiliada != ''
            """),
            {"slug": slug},
        )

        return result.scalar() or 0


    # =====================================================
    # SITEMAP
    # =====================================================

    def list_categories_for_sitemap(self):
        """
        Retorna apenas os dados necessários
        para geração do sitemap.
        Query leve.
        """

        result = self.db.execute(
            text("""
                SELECT
                    c.slug,
                    c.created_at
                FROM categorias c
                WHERE c.slug IS NOT NULL
            """)
        )

        return result.mappings().all()



    # =====================================================
    # CATEGORIES WITH BELOW AVERAGE COUNT
    # =====================================================

    def get_categories_with_below_average_count(self):
        result = self.db.execute(
            text("""
                WITH precos_ordenados AS (
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

                preco_atual AS (
                    SELECT produto_id, preco
                    FROM precos_ordenados
                    WHERE rn = 1
                ),

                media_precos AS (
                    SELECT
                        produto_id,
                        AVG(preco) AS preco_medio
                    FROM produto_preco_historico
                    GROUP BY produto_id
                ),

                produtos_abaixo_media AS (
                    SELECT
                        p.id,
                        pc.categoria_id
                    FROM produtos p

                    JOIN preco_atual pa
                        ON pa.produto_id = p.id

                    JOIN media_precos mp
                        ON mp.produto_id = p.id

                    JOIN links_afiliados la
                        ON la.produto_id = p.id
                        AND la.status = 'ok'
                        AND la.url_afiliada IS NOT NULL
                        AND la.url_afiliada != ''

                    JOIN produto_categoria pc
                        ON pc.produto_id = p.id

                    WHERE pa.preco < mp.preco_medio
                )

                SELECT
                    c.nome,
                    c.slug,
                    COUNT(*) AS count
                FROM produtos_abaixo_media pam
                JOIN categorias c
                    ON c.id = pam.categoria_id
                GROUP BY c.id
                HAVING COUNT(*) > 0
                ORDER BY count DESC
            """)
        )

        return result.mappings().all()
