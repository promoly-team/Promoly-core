from decimal import Decimal
from sqlalchemy import text


class ProdutoPrecoRepository:
    def __init__(self, conn):
        self.conn = conn

    def get_last_price(self, produto_id: int):
        result = self.conn.execute(
            text("""
                SELECT preco
                FROM produto_preco_historico
                WHERE produto_id = :produto_id
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {"produto_id": produto_id},
        )

        row = result.first()
        if row is None:
            return None

        preco = row[0]
        return float(preco) if isinstance(preco, Decimal) else preco

    def insert(self, produto_id: int, preco):
        self.conn.execute(
            text("""
                INSERT INTO produto_preco_historico (produto_id, preco)
                VALUES (:produto_id, :preco)
            """),
            {
                "produto_id": produto_id,
                "preco": float(preco),
            },
        )

        # 🔥 ISSO É O QUE FALTAVA
        self.conn.commit()
