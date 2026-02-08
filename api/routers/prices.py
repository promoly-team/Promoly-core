from fastapi import APIRouter, Depends
from sqlalchemy import text
from api.deps import get_db

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/{produto_id}")
def get_prices(produto_id: int, db=Depends(get_db)):
    result = db.execute(
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
            "data": row["created_at"],
        }
        for row in rows
    ]
