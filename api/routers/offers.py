from fastapi import APIRouter, Depends
from api.deps import get_db

router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("/")
def get_offers(limit: int = 20, db=Depends(get_db)):
    cursor = db.execute(
        """
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
        LIMIT ?;
        """,
        (limit,),
    )

    rows = cursor.fetchall()

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
