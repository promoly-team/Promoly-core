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
        return row[0] if row else None

    def insert(self, produto_id: int, preco):
        self.conn.execute(
            text("""
                INSERT INTO produto_preco_historico (produto_id, preco)
                VALUES (:produto_id, :preco)
            """),
            {
                "produto_id": produto_id,
                "preco": preco,
            },
        )
