from sqlalchemy import text
from database.db import get_connection

query = text("""
    SELECT p.id
    FROM produtos p
    LEFT JOIN produto_preco_historico pph
        ON pph.produto_id = p.id
    GROUP BY p.id
    HAVING COUNT(pph.id) < 3;
""")

with get_connection() as conn:
    result = conn.execute(query)
    ids = [row[0] for row in result]

print(ids)