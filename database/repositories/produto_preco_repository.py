class ProdutoPrecoRepository:
    def __init__(self, conn):
        self.conn = conn

    def get_last_price(self, produto_id: int):
        cursor = self.conn.execute(
            """
            SELECT preco
            FROM produto_preco_historico
            WHERE produto_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (produto_id,),
        )
        row = cursor.fetchone()
        return row["preco"] if row else None

    def insert(self, produto_id: int, preco):
        self.conn.execute(
            """
            INSERT INTO produto_preco_historico (produto_id, preco)
            VALUES (?, ?)
            """,
            (produto_id, float(preco)),
        )
        self.conn.commit()

