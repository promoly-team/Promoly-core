from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional


class PriceService:

    def __init__(self, db: Session):
        self.db = db

    def get_price_history(
        self,
        produto_id: Optional[int] = None,
        produto_ids: Optional[List[int]] = None,
    ):
        """
        Retorna histórico de preços.

        Pode receber:
        - produto_id (int)
        - produto_ids (List[int])
        """

        if produto_id is None and not produto_ids:
            raise ValueError("É necessário informar produto_id ou produto_ids")

        if produto_id:
            produto_ids = [produto_id]

        query = text("""
            SELECT produto_id, preco, created_at
            FROM produto_preco_historico
            WHERE produto_id = ANY(:produto_ids)
            ORDER BY produto_id, created_at ASC
        """)

        result = self.db.execute(
            query,
            {"produto_ids": produto_ids},
        )

        rows = result.mappings().all()

        # Se for apenas um produto, mantém compatibilidade antiga
        if len(produto_ids) == 1:
            return [
                {
                    "preco": float(row["preco"]),
                    "created_at": row["created_at"],
                }
                for row in rows
            ]

        # Se for múltiplos, agrupa por produto_id
        grouped = {}

        for row in rows:
            pid = row["produto_id"]

            if pid not in grouped:
                grouped[pid] = []

            grouped[pid].append({
                "preco": float(row["preco"]),
                "created_at": row["created_at"],
            })

        return grouped
