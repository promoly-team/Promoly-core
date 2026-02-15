from sqlalchemy import text
from sqlalchemy.orm import Session


class OfferService:
    """
    Camada de serviço responsável por recuperar ofertas
    recentes com link afiliado válido.

    Centraliza:
    - Consulta SQL
    - Regras de filtro (status ok, link válido)
    - Mapeamento de resposta
    """

    def __init__(self, db: Session):
        self.db = db

    def get_offers(self, limit: int = 20):
        """
        Retorna as ofertas mais recentes com link afiliado ativo.
        """

        result = self.db.execute(
            text("""
                SELECT
                    p.id AS produto_id,
                    p.titulo,
                    p.imagem_url,
                    p.preco,
                    la.url_afiliada
                FROM produtos p
                JOIN links_afiliados la
                    ON la.produto_id = p.id
                    AND la.url_afiliada IS NOT NULL
                    AND la.url_afiliada != ''
                    AND la.status = 'ok'
                ORDER BY p.created_at DESC
                LIMIT :limit
            """),
            {"limit": limit},
        )

        rows = result.mappings().all()

        return [
            {
                "produto_id": row["produto_id"],
                "titulo": row["titulo"],
                "imagem_url": row["imagem_url"],
                "preco": float(row["preco"]) if row["preco"] is not None else None,
                "url_afiliada": row["url_afiliada"],
            }
            for row in rows
        ]
