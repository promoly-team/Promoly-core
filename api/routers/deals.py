from fastapi import APIRouter, Depends
from api.deps import get_db

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("/")
def get_deals(limit: int = 20, db=Depends(get_db)):
    cursor = db.execute(
        """WITH precos AS (
    SELECT
        produto_id,
        preco,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY produto_id
            ORDER BY created_at DESC
        ) AS rn
    FROM produto_preco_historico
)

SELECT
    p.id AS produto_id,
    p.titulo,
    p.imagem_url,

    u.preco AS preco_atual,
    a.preco AS preco_anterior,

    ROUND(
        (a.preco - u.preco) * 100.0 / NULLIF(a.preco, 0),
        2
    ) AS desconto_pct,

    la.url_afiliada
FROM produtos p

JOIN links_afiliados la
    ON la.produto_id = p.id
    AND la.status = 'ok'
    AND la.url_afiliada IS NOT NULL
    AND la.url_afiliada != ''

JOIN precos u
    ON u.produto_id = p.id AND u.rn = 1

JOIN precos a
    ON a.produto_id = p.id AND a.rn = 2

WHERE u.preco < a.preco
ORDER BY desconto_pct DESC
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
            "preco_atual": float(row["preco_atual"]),
            "preco_anterior": float(row["preco_anterior"]),
            "desconto_pct": float(row["desconto_pct"]),
        }
        for row in rows
    ]
