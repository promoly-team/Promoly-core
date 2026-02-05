from fastapi import APIRouter, Depends
from api.deps import get_db

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/{produto_id}")
def get_prices(produto_id: int, db=Depends(get_db)):
    cursor = db.execute(
        """
        SELECT preco, created_at
        FROM produto_preco_historico
        WHERE produto_id = ?
        ORDER BY created_at ASC
        """,
        (produto_id,),
    )

    rows = cursor.fetchall()

    # 🔥 conversão EXPLÍCITA (obrigatória)
    result = []
    for row in rows:
        result.append({
            "preco": float(row["preco"]),
            "data": row["created_at"],
        })

    return result
