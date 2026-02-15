from sqlalchemy import text
from sqlalchemy.orm import Session

from api.utils.pricing import calculate_discount


class CategoryService:
    """
    Camada de serviço responsável por recuperar produtos
    por categoria.

    Responsabilidades:
    - Consulta de produtos vinculados à categoria
    - Recuperação de preço atual e anterior
    - Aplicação da regra de desconto no domínio
    - Ordenação por maior desconto
    """

    def __init__(self, db: Session):
        self.db = db

    def get_products_by_category(
        self,
        categoria_id: int,
        limit: int = 20,
    ):
        """
        Retorna produtos de uma categoria específica,
        ordenados pelo maior desconto percentual.
        """

        result = self.db.execute(
            text("""
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
                    p.titulo,
                    p.imagem_url,
                    u.preco AS preco_atual,
                    a.preco AS preco_anterior,
                    la.url_afiliada
                FROM produtos p
                JOIN produto_categoria pc
                    ON pc.produto_id = p.id
                    AND pc.categoria_id = :categoria_id

                JOIN links_afiliados la
                    ON la.produto_id = p.id
                    AND la.status = 'ok'
                    AND la.url_afiliada IS NOT NULL
                    AND la.url_afiliada != ''

                JOIN precos u
                    ON u.produto_id = p.id AND u.rn = 1
                LEFT JOIN precos a
                    ON a.produto_id = p.id AND a.rn = 2

                LIMIT :limit
            """),
            {
                "categoria_id": categoria_id,
                "limit": limit,
            },
        )

        rows = result.mappings().all()

        produtos = []

        for row in rows:
            preco_atual = (
                float(row["preco_atual"])
                if row["preco_atual"] is not None
                else None
            )

            preco_anterior = (
                float(row["preco_anterior"])
                if row["preco_anterior"] is not None
                else None
            )

            desconto = calculate_discount(
                preco_atual,
                preco_anterior,
            )

            produtos.append(
                {
                    "produto_id": row["produto_id"],
                    "titulo": row["titulo"],
                    "imagem_url": row["imagem_url"],
                    "preco_atual": preco_atual,
                    "preco_anterior": preco_anterior,
                    "desconto_pct": desconto,
                    "url_afiliada": row["url_afiliada"],
                }
            )

        # -------------------------------------------------
        # Ordenação por maior desconto
        # -------------------------------------------------

        produtos.sort(
            key=lambda x: (
                x["desconto_pct"] is None,
                -(x["desconto_pct"] or 0),
            )
        )

        return produtos
