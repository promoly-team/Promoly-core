from sqlalchemy import text
from sqlalchemy.orm import Session


class AffiliateService:
    """
    Camada de serviço responsável por operações
    relacionadas a links afiliados.

    Centraliza:
    - Consulta ao link afiliado
    - Regra de existência
    - Mapeamento da resposta
    """

    def __init__(self, db: Session):
        self.db = db

    def get_affiliate_link(self, produto_id: int):
        """
        Retorna o link afiliado de um produto.
        Retorna None se não encontrado.
        """

        result = self.db.execute(
            text("""
                SELECT
                    produto_id,
                    url_afiliada,
                    status
                FROM links_afiliados
                WHERE produto_id = :produto_id
                LIMIT 1
            """),
            {"produto_id": produto_id},
        )

        row = result.mappings().first()

        if row is None:
            return None

        return {
            "produto_id": int(row["produto_id"]),
            "url_afiliada": row["url_afiliada"],
            "status": row["status"],
        }
