# api/routers/categories.py
from fastapi import APIRouter, Depends
from sqlalchemy import text
from api.deps import get_db

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/{categoria_id}/products/")
def get_products_by_category(
    categoria_id: int,
    limit: int = 20,
    db=Depends(get_db),
):
    result = db.execute(
        text("""
            WITH precos AS (
                SELECT
                    produto_id,
                    preco,
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

                CASE
                    WHEN a.preco IS NOT NULL AND a.preco > u.preco
                    THEN ROUND(
                        ((a.preco - u.preco) * 100.0 / a.preco)::numeric,
                        2
                    )
                    ELSE NULL
                END AS desconto_pct,

                la.url_afiliada
            FROM produtos p
            JOIN produto_categoria pc
                ON pc.produto_id = p.id
                AND pc.categoria_id = :categoria_id

            JOIN links_afiliados la
                ON la.produto_id = p.id
                AND la.status = 'ok'
                AND la.url_afiliada IS NOT NULL
                AND la.url_afiliada != ''

            JOIN precos u
                ON u.produto_id = p.id AND u.rn = 1
            LEFT JOIN precos a
                ON a.produto_id = p.id AND a.rn = 2

            WHERE p.status IN ('ativo', 'novo')
            ORDER BY desconto_pct DESC NULLS LAST, p.updated_at DESC
            LIMIT :limit
        """),
        {
            "categoria_id": categoria_id,
            "limit": limit,
        },
    )

    rows = result.mappings().all()

    return [
        {
            "produto_id": r["produto_id"],
            "titulo": r["titulo"],
            "imagem_url": r["imagem_url"],
            "preco_atual": float(r["preco_atual"]),
            "preco_anterior": float(r["preco_anterior"])
                if r["preco_anterior"] is not None else None,
            "desconto_pct": float(r["desconto_pct"])
                if r["desconto_pct"] is not None else None,
            "url_afiliada": r["url_afiliada"],
        }
        for r in rows
    ]
