from sqlalchemy import text
from sqlalchemy.orm import Session

from api.utils.pricing import calculate_discount


class DealService:
    """
    Camada de serviço responsável por recuperar produtos
    com queda real de preço (deals).

    Responsabilidades:
    - Consulta SQL para recuperar preços atual e anterior
    - Aplicar regra de negócio para cálculo de desconto
    - Ordenar por maior desconto
    - Mapear resposta final da API
    """

    def __init__(self, db: Session):
        self.db = db

    def get_deals(self, limit: int = 20):
        """
        Retorna produtos cujo preço atual é menor que o anterior,
        ordenados pelo maior desconto percentual.

        O cálculo de desconto é feito na camada de domínio (Python).
        """

        result = self.db.execute(
            text("""
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
                )
                SELECT
                    p.id AS produto_id,
                    p.titulo,
                    p.imagem_url,
                    u.preco AS preco_atual,
                    a.preco AS preco_anterior,
                    la.url_afiliada
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

                WHERE u.preco < a.preco
                LIMIT :limit
            """),
            {"limit": limit},
        )

        rows = result.mappings().all()

        deals = []

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

            deals.append(
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
        # Ordenação por maior desconto (domínio)
        # -------------------------------------------------

        deals.sort(
            key=lambda x: (
                x["desconto_pct"] is None,
                -(x["desconto_pct"] or 0),
            )
        )

        return deals
