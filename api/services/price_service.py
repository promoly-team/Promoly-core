from sqlalchemy import text
from sqlalchemy.orm import Session


class PriceService:
    """
    Camada de serviço responsável por operações relacionadas
    ao histórico de preços dos produtos.

    Centraliza:
    - Consulta ao histórico
    - Ordenação cronológica
    - Mapeamento de resposta
    """

    def __init__(self, db: Session):
        self.db = db

    def get_price_history(self, produto_id: int):
        """
        Retorna o histórico completo de preços de um produto,
        ordenado cronologicamente.
        """

        result = self.db.execute(
            text("""
                SELECT preco, created_at
                FROM produto_preco_historico
                WHERE produto_id = :produto_id
                ORDER BY created_at ASC
            """),
            {"produto_id": produto_id},
        )

        rows = result.mappings().all()

        return [
            {
                "preco": float(row["preco"]),
                "created_at": row["created_at"],
            }
            for row in rows
        ]
